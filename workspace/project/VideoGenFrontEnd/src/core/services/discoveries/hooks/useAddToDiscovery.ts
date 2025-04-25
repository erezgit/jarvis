import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '../service';
import { DiscoveryServiceTypes } from '../types';
import { invalidateDiscoveryQueries, invalidateAvailableVideosQueries } from '../queryKeys';
import { mapDiscoveryResponseToVideo } from '../mappers';

/**
 * Hook for adding a video to the discovery section
 * 
 * This hook adds a video to the discovery section and invalidates
 * the relevant queries to ensure the UI is updated.
 */
export const useAddToDiscovery = (
  options?: UseMutationOptions<
    DiscoveryServiceTypes['Video'],
    Error,
    DiscoveryServiceTypes['AddToDiscoveryRequest']
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DiscoveryServiceTypes['Video'],
    Error,
    DiscoveryServiceTypes['AddToDiscoveryRequest']
  >({
    mutationFn: async (request) => {
      const result = await discoveryService.addToDiscovery(request);
      
      if (result.error) {
        throw result.error;
      }
      
      // Transform API response to standardized Video type
      return result.data ? mapDiscoveryResponseToVideo(result.data) : null;
    },
    onSuccess: () => {
      // Invalidate discovery queries to refresh the list
      invalidateDiscoveryQueries(queryClient);
      
      // Invalidate available videos queries to refresh the list
      invalidateAvailableVideosQueries(queryClient);
    },
    ...options
  });
};

export default useAddToDiscovery;
