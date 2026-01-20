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
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    updateProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<SystemUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_id', userId)
                .maybeSingle();

            if (!error && data) {
                setProfile(data);
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
                // If the session is the same, don't trigger a full reload of profile unless user changed
                // But simplified: just set everything
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    // Only fetch profile if it's a different user or we don't have one
                    // For simplicity in this fix, we await it to ensure consistency
                    await fetchProfile(newSession.user.id);
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

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            loading,
            isAuthenticated: !!session,
            isAdmin: profile?.role === 'admin',
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
