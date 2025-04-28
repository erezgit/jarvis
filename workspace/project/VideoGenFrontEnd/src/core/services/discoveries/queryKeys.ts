import { QueryClient } from '@tanstack/react-query';

/**
 * Discovery service query keys
 * 
 * This file contains standardized query keys for the Discovery service.
 * Following the project's query key structure pattern.
 */
export const DISCOVERY_KEYS = {
  all: ['discoveries'] as const,
  lists: () => [...DISCOVERY_KEYS.all] as const,
  availableVideos: () => ['discoveries', 'available'] as const,
  detail: (id: string) => ['discoveries', id] as const,
};

/**
 * Standard query invalidation function for Discovery queries
 * 
 * This function invalidates Discovery-related queries based on the provided ID.
 * If no ID is provided, it invalidates all Discovery queries.
 */
export const invalidateDiscoveryQueries = (queryClient: QueryClient, id?: string) => {
  if (id) {
    // Invalidate specific discovery
    queryClient.invalidateQueries({
      queryKey: DISCOVERY_KEYS.detail(id)
    });
  } else {
    // Invalidate all discoveries
    queryClient.invalidateQueries({
      queryKey: DISCOVERY_KEYS.all
    });
  }
};

/**
 * Invalidate available videos queries
 */
export const invalidateAvailableVideosQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: DISCOVERY_KEYS.availableVideos()
  });
};

export default DISCOVERY_KEYS;
