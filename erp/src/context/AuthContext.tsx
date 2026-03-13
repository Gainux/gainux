import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { SystemUser, Organization } from "@/modules/system/types";

// Extends Auth Context to include Profile Data
interface AuthContextType {
    session: any;
    user: User | null;
    profile: SystemUser | null;
    organization: Organization | null;
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
    organization: null,
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
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const loadingTimeoutRef = useRef<number | null>(null);
    // Track the user ID for which we last successfully loaded a profile so
    // that token-refresh-triggered SIGNED_IN events don't re-fetch needlessly.
    const lastProfileUserIdRef = useRef<string | null>(null);

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
                        supabase.from('profiles').update({ org_id: employeeData.org_id }).eq('id', profileData.id).then(
                            () => {},
                            (err) => console.error('AuthContext: Failed to heal profile org_id:', err)
                        );
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
                lastProfileUserIdRef.current = userId;
                setProfile(profileData);
                if (profileData.org_id) {
                    const { data: orgData } = await supabase
                        .from('organizations')
                        .select('*')
                        .eq('id', profileData.org_id)
                        .maybeSingle();
                    if (orgData) setOrganization(orgData as Organization);
                }
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
                    setOrganization(null);
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
                    if (_event === 'TOKEN_REFRESHED') {
                        // Session refreshed in the background — no need to re-fetch profile.
                        if (loadingTimeoutRef.current) {
                            clearTimeout(loadingTimeoutRef.current);
                            loadingTimeoutRef.current = null;
                        }
                        setLoading(false);
                        return;
                    }

                    if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
                        // Skip the fetch if we already have the profile for this user
                        // (e.g. SIGNED_IN re-fires after a network reconnect).
                        if (lastProfileUserIdRef.current !== newSession.user.id) {
                            try {
                                await fetchProfile(newSession.user.id);
                            } catch (error) {
                                console.error('Error fetching profile during auth state change:', error);
                            }
                        }
                    } else if (_event === 'SIGNED_OUT') {
                        lastProfileUserIdRef.current = null;
                        setProfile(null);
                    }
                } else {
                    lastProfileUserIdRef.current = null;
                    setProfile(null);
                }

                // Clear any existing timeout
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                    loadingTimeoutRef.current = null;
                }
                setLoading(false);
            }
        });

        // Set a safety timeout to prevent infinite loading (30 seconds)
        loadingTimeoutRef.current = setTimeout(() => {
            console.warn('Loading timeout reached - forcing loading state to false');
            setLoading(false);
        }, 30000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
            }
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

    // Periodic session validation to prevent infinite loading
    useEffect(() => {
        if (!session) return;

        // Check session validity every 5 minutes
        const intervalId = setInterval(async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();

                // On network errors (e.g. timeout, offline), the error message usually contains fetch or network keywords
                // We should NOT log the user out if it's just a temporary network disconnect.
                const isNetworkError = error?.message?.toLowerCase().includes('fetch') ||
                    error?.message?.toLowerCase().includes('network') ||
                    error?.name === 'AbortError' ||
                    (error as any)?.code === 'ERR_NETWORK';

                if (error && isNetworkError) {
                    console.warn('Session check failed due to network error, keeping session intact.');
                    return;
                }

                if (error || !currentSession) {
                    console.warn('Session validation failed, session may be expired');
                    // Session is invalid - clear auth state
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setOrganization(null);
                }
            } catch (error) {
                console.error('Error checking session validity:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
            clearInterval(intervalId);
        };
    }, [session]);

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
        setOrganization(null);
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            organization,
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

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
