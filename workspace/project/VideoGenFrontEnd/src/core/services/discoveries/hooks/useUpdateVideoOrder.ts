import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '../service';
import { DiscoveryServiceTypes } from '../types';
import { invalidateDiscoveryQueries } from '../queryKeys';
import { mapDiscoveryResponseToVideo } from '../mappers';

/**
 * Hook for updating the display order of a video in the discovery section
 * 
 * This hook updates the display order of a video in the discovery section
 * and invalidates the relevant queries to ensure the UI is updated.
 */
export const useUpdateVideoOrder = (
  options?: UseMutationOptions<
    DiscoveryServiceTypes['Video'],
    Error,
    { id: string; request: DiscoveryServiceTypes['UpdateOrderRequest'] }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DiscoveryServiceTypes['Video'],
    Error,
    { id: string; request: DiscoveryServiceTypes['UpdateOrderRequest'] }
  >({
    mutationFn: async ({ id, request }) => {
      const result = await discoveryService.updateVideoOrder(id, request);
      
      if (result.error) {
        throw result.error;
      }
      
      // Transform API response to standardized Video type
      return result.data ? mapDiscoveryResponseToVideo(result.data) : null;
    },
    onSuccess: (_, variables) => {
      // Invalidate discovery queries to refresh the list
      invalidateDiscoveryQueries(queryClient, variables.id);
    },
    ...options
  });
};

export default useUpdateVideoOrder;
