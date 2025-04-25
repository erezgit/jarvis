import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
export function useBaseQuery(queryKey, queryFn, options = {}) {
    const { isAuthenticated, status } = useAuth();
    const isReady = status === 'authenticated';
    return useQuery({
        queryKey,
        queryFn,
        enabled: isReady && isAuthenticated && options.enabled !== false,
        retry: (failureCount, error) => {
            // Don't retry on 401/403 errors
            if (error instanceof Error &&
                (error.message.includes('401') || error.message.includes('403'))) {
                return false;
            }
            return failureCount < 3;
        },
        ...options,
    });
}
