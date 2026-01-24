import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';

interface SupabaseResponse<T> {
    data: T | null;
    error: PostgrestError | null;
}

/**
 * Wrapper for Supabase queries with automatic session refresh on auth errors
 * Prevents infinite loading by handling expired sessions gracefully
 */
export async function withSessionRefresh<T>(
    queryFn: () => Promise<SupabaseResponse<T>>,
    maxRetries = 1
): Promise<SupabaseResponse<T>> {
    let attempts = 0;

    while (attempts <= maxRetries) {
        try {
            const result = await queryFn();

            // Check for auth-related errors
            if (result.error) {
                const isAuthError =
                    result.error.message?.toLowerCase().includes('jwt') ||
                    result.error.message?.toLowerCase().includes('token') ||
                    result.error.message?.toLowerCase().includes('session') ||
                    result.error.code === 'PGRST301'; // PostgREST auth error

                if (isAuthError && attempts < maxRetries) {
                    console.warn('Auth error detected, attempting session refresh...', result.error);

                    // Try to refresh the session
                    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

                    if (refreshError || !session) {
                        console.error('Session refresh failed:', refreshError);
                        // Session refresh failed - user needs to re-login
                        // Return the error instead of retrying
                        return {
                            data: null,
                            error: {
                                ...result.error,
                                message: 'Session expired. Please log in again.'
                            } as PostgrestError
                        };
                    }

                    console.log('Session refreshed successfully, retrying query...');
                    attempts++;
                    continue; // Retry the query
                }
            }

            // No auth error or max retries reached
            return result;
        } catch (error) {
            console.error('Unexpected error in query wrapper:', error);
            return {
                data: null,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: '',
                    hint: '',
                    code: 'UNKNOWN'
                } as PostgrestError
            };
        }
    }

    // Should never reach here, but TypeScript needs it
    return { data: null, error: null };
}

/**
 * Safe query executor that logs errors and returns null on failure
 * Use this for non-critical queries where you want graceful degradation
 */
export async function safeQuery<T>(
    queryFn: () => Promise<SupabaseResponse<T>>,
    context: string
): Promise<T | null> {
    try {
        const result = await withSessionRefresh(queryFn);

        if (result.error) {
            console.error(`[${context}] Query failed:`, result.error);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error(`[${context}] Unexpected error:`, error);
        return null;
    }
}
