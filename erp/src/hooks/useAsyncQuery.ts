import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UseAsyncQueryOptions {
    /**
     * Maximum time to wait for the query before timing out (in milliseconds)
     * Default: 30000 (30 seconds)
     */
    timeout?: number;

    /**
     * Whether to redirect to login on auth errors
     * Default: true
     */
    redirectOnAuthError?: boolean;

    /**
     * Callback when query times out
     */
    onTimeout?: () => void;
}

interface UseAsyncQueryResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for handling async queries with timeout and auth error handling
 * Prevents infinite loading states and handles session expiration
 */
export function useAsyncQuery<T>(
    queryFn: () => Promise<T>,
    dependencies: any[] = [],
    options: UseAsyncQueryOptions = {}
): UseAsyncQueryResult<T> {
    const {
        timeout = 30000,
        redirectOnAuthError = true,
        onTimeout
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const mountedRef = useRef(true);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const executeQuery = async () => {
        if (!mountedRef.current) return;

        setLoading(true);
        setError(null);

        // Set timeout
        timeoutRef.current = window.setTimeout(() => {
            if (!mountedRef.current) return;

            console.warn('Query timeout reached');
            setLoading(false);
            setError(new Error('Request timed out. Please try again.'));

            if (onTimeout) {
                onTimeout();
            }
        }, timeout);

        try {
            const result = await queryFn();

            if (!mountedRef.current) return;

            // Clear timeout on success
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            setData(result);
            setError(null);
        } catch (err) {
            if (!mountedRef.current) return;

            // Clear timeout on error
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            const error = err instanceof Error ? err : new Error('Unknown error occurred');
            console.error('Query error:', error);

            // Check if it's an auth error
            const isAuthError =
                error.message.toLowerCase().includes('jwt') ||
                error.message.toLowerCase().includes('token') ||
                error.message.toLowerCase().includes('session') ||
                error.message.toLowerCase().includes('expired');

            if (isAuthError && redirectOnAuthError && !isAuthenticated) {
                console.warn('Auth error detected, redirecting to login...');
                navigate('/auth/login');
                return;
            }

            setError(error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        executeQuery();

        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        data,
        loading,
        error,
        refetch: executeQuery
    };
}

/**
 * Hook for handling mutations (create, update, delete operations)
 */
export function useAsyncMutation<T, Args extends any[]>(
    mutationFn: (...args: Args) => Promise<T>,
    options: UseAsyncQueryOptions = {}
) {
    const { timeout = 30000 } = options;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const execute = async (...args: Args): Promise<T | null> => {
        setLoading(true);
        setError(null);

        // Set timeout
        timeoutRef.current = window.setTimeout(() => {
            console.warn('Mutation timeout reached');
            setLoading(false);
            setError(new Error('Request timed out. Please try again.'));
        }, timeout);

        try {
            const result = await mutationFn(...args);

            // Clear timeout on success
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            setError(null);
            return result;
        } catch (err) {
            // Clear timeout on error
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            const error = err instanceof Error ? err : new Error('Unknown error occurred');
            console.error('Mutation error:', error);
            setError(error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        execute,
        loading,
        error,
        reset: () => {
            setError(null);
            setLoading(false);
        }
    };
}
