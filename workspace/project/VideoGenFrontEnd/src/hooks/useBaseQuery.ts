import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

type QueryOptions<TData, TError> = Omit<
  UseQueryOptions<TData, TError, TData>,
  'queryKey' | 'queryFn'
>;

export function useBaseQuery<TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: QueryOptions<TData, TError> = {},
) {
  const { isAuthenticated, status } = useAuth();
  const isReady = status === 'authenticated';

  return useQuery({
    queryKey,
    queryFn,
    enabled: isReady && isAuthenticated && options.enabled !== false,
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 401/403 errors
      if (
        error instanceof Error &&
        (error.message.includes('401') || error.message.includes('403'))
      ) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}
