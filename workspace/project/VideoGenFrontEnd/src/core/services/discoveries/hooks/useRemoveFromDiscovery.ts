import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '../service';
import { invalidateDiscoveryQueries, invalidateAvailableVideosQueries } from '../queryKeys';

/**
 * Hook for removing a video from the discovery section
 * 
 * This hook removes a video from the discovery section and invalidates
 * the relevant queries to ensure the UI is updated.
 */
export const useRemoveFromDiscovery = (
  options?: UseMutationOptions<
    boolean,
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      const result = await discoveryService.removeFromDiscovery(id);
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data || false;
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

export default useRemoveFromDiscovery;
