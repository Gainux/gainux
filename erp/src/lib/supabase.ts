import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Warn only in development, or handle gracefully
    console.warn("Supabase URL or Anon Key is missing. Check .env.local");
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            // Refresh token before it expires
            storage: typeof window !== 'undefined' ? window.localStorage : undefined
        },
        // Add timeout to prevent infinite loading
        db: {
            schema: 'public',
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
);
