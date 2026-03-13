import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Warn only in development, or handle gracefully
    console.warn("Supabase URL or Anon Key is missing. Check .env.local");
}

// Wrap fetch with a 12-second timeout so requests on a dead/idle connection
// throw an error instead of hanging forever (common after long inactivity).
const fetchWithTimeout: typeof fetch = (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    // If the caller already supplies a signal, honour both
    const existingSignal = (init as RequestInit | undefined)?.signal;
    if (existingSignal) {
        existingSignal.addEventListener('abort', () => controller.abort());
    }
    return fetch(input, { ...init, signal: controller.signal }).finally(() =>
        clearTimeout(timer)
    );
};

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined
        },
        global: {
            fetch: fetchWithTimeout,
        },
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
