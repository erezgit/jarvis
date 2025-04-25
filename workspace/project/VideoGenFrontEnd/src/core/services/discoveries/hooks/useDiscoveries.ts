import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { discoveryService } from '../service';
import { DiscoveryServiceTypes } from '../types';
import { DISCOVERY_KEYS } from '../queryKeys';
import { mapDiscoveryResponseToVideo } from '../mappers';

/**
 * Hook for fetching discovery videos
 * 
 * This hook fetches all videos in the discovery section and transforms
 * the API response to the standardized Video type.
 */
export const useDiscoveries = (
  options?: UseQueryOptions<
    DiscoveryServiceTypes['Video'][], 
    Error
  >
) => {
  return useQuery<DiscoveryServiceTypes['Video'][], Error>({
    queryKey: DISCOVERY_KEYS.lists(),
    queryFn: async () => {
      const result = await discoveryService.getDiscoveries();
      
      if (result.error) {
        throw result.error;
      }
      
      // Transform API response to standardized Video type
      return (result.data || []).map(mapDiscoveryResponseToVideo);
    },
    ...options
  });
};

export default useDiscoveries;
