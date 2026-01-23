import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { SystemUser } from "@/modules/system/types";

// Extends Auth Context to include Profile Data
interface AuthContextType {
    session: any;
    user: User | null;
    profile: SystemUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    updateProfile: (data: Partial<SystemUser>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    updateProfile: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<SystemUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            // 1. Try fetching from profiles
            let { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_id', userId)
                .maybeSingle();

            if (error) {
                // If fetching by auth_id fails, try fetching by id (common pattern is id=auth_uid)
                const { data: profileById, error: errorById } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                if (!errorById && profileById) {
                    profileData = profileById;
                }
            }

            // 2. Fallback: If profile missing or org_id missing, check employees table
            if (!profileData?.org_id) {
                console.warn("AuthContext: Profile missing org_id, checking employees table fallback...");
                const { data: employeeData } = await supabase
                    .from('employees')
                    .select('org_id, first_name, last_name')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (employeeData?.org_id) {
                    console.log("AuthContext: Found employee data:", employeeData);
                    if (profileData) {
                        profileData.org_id = employeeData.org_id;
                        // If role is employee, we prioritize employee table names for display consistency
                        if (profileData.role === 'employee') {
                            profileData.full_name = `${employeeData.first_name} ${employeeData.last_name}`;
                        }
                        // Optional: Heal the profile in DB asynchronously
                        supabase.from('profiles').update({ org_id: employeeData.org_id }).eq('id', profileData.id).then();
                    } else {
                        // Create a temporary profile object if completely missing (rare but possible)
                        profileData = {
                            id: userId,
                            auth_id: userId,
                            email: user?.email || '',
                            role: 'employee',
                            status: 'active',
                            org_id: employeeData.org_id,
                            full_name: `${employeeData.first_name} ${employeeData.last_name}`,
                            created_at: new Date().toISOString()
                        } as SystemUser;
                    }
                }
            }

            if (profileData) {
                setProfile(profileData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // 1. Get initial session
            const { data: { session: initialSession } } = await supabase.auth.getSession();

            if (mounted) {
                setSession(initialSession);
                setUser(initialSession?.user ?? null);

                if (initialSession?.user) {
                    await fetchProfile(initialSession.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (mounted) {
                // const previousUser = user;
                setSession(newSession);
                setUser(newSession?.user ?? null);
                if (newSession?.user) {
                    // Only fetch profile if it's a different user or if we don't have a profile yet
                    // Check against previous user state (captured in closure or via ref if needed, but setState is async)
                    // Better to rely on the fact that if we have a profile and the ID matches, we skip.

                    // We need to access the current value of 'user' or 'profile'. 
                    // Since this effect closes over 'user' and 'profile' from initial render (null), 
                    // we should use a ref to track the current ID or trust that 'setUser' update will trigger the dependency elsewhere if we split logic.
                    // But here we are doing it imperatively.
                    // Let's use a simple check: compare with the user.id from the state setter if possible, or just use a ref for lastUserId.

                    // Actually, simpler approach:
                    // If we have a user and the new session user ID is same, SKIPP fetch.

                    // To do this reliably without stale closures, let's use a check inside the fetchProfile or check against a Ref.
                    // But wait, the previous code was `await fetchProfile`.

                    // Let's change the logic:
                    // Just set session/user.  Move profile fetching to a useEffect dependent on `user`.
                    // BUT `initializeAuth` does it manually.

                    // Let's stick to the plan: Check ID.
                    // Since 'user' in this callback might be stale (from closure), we can't rely on it directly unless we add it to dependency array, which re-subscribes.
                    // Re-subscribing is fine.

                    // However, `supabase.auth.onAuthStateChange` fires on 'TOKEN_REFRESHED'.
                    // We can check the event type.

                    if (_event === 'TOKEN_REFRESHED') {
                        console.log("Token refreshed, skipping profile re-fetch.");
                        setLoading(false);
                        return;
                    }

                    // For SIGN_IN or INITIAL_SESSION, we fetch.
                    // But wait, if we are already logged in and reload, it might be INITIAL_SESSION.
                    // If we switch users, it is SIGN_IN.

                    // Best fix: Check event type.
                    // Events: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY'.

                    if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
                        // We might already have the profile if it's just a remount, but safe to fetch once.
                        // But we want to avoid re-fetching if we just refreshed.
                        await fetchProfile(newSession.user.id);
                    } else if (_event === 'SIGNED_OUT') {
                        setProfile(null);
                    }
                    // For TOKEN_REFRESHED, we do nothing but update session (done above).
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Real-time profile updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`profile:${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `auth_id=eq.${user.id}`
            }, (payload) => {
                console.log("Profile updated:", payload.new);
                setProfile(payload.new as any);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const updateProfile = async (data: Partial<SystemUser>) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('auth_id', user.id);

        if (error) throw error;

        // Optimistic update
        setProfile(prev => prev ? { ...prev, ...data } : null);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            loading,
            isAuthenticated: !!session,
            isAdmin: profile?.role === 'admin',
            updateProfile,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
