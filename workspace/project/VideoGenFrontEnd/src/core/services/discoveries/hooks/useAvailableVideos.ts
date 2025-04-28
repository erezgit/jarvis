import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { discoveryService } from '../service';
import { DiscoveryServiceTypes } from '../types';
import { DISCOVERY_KEYS } from '../queryKeys';
import { mapAvailableVideoResponseToVideo } from '../mappers';

/**
 * Hook for fetching available videos for discovery
 * 
 * This hook fetches all videos that can be added to the discovery section
 * and transforms the API response to the standardized Available Video type.
 * 
 * Note: This endpoint previously required admin role, but the restriction
 * has been temporarily removed while maintaining authentication requirements.
 */
export const useAvailableVideos = (
  options?: UseQueryOptions<
    DiscoveryServiceTypes['AvailableVideo'][], 
    Error
  >
) => {
  return useQuery<DiscoveryServiceTypes['AvailableVideo'][], Error>({
    queryKey: DISCOVERY_KEYS.availableVideos(),
    queryFn: async () => {
      console.log('[useAvailableVideos][DEBUG] Starting query function');
      const result = await discoveryService.getAvailableVideos();
      
      console.log('[useAvailableVideos][DEBUG] Service result:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        hasError: !!result.error,
        errorMessage: result.error?.message
      });
      
      if (result.error) {
        // Handle authorization errors gracefully
        if (result.error.message?.includes('insufficient permissions')) {
          console.error('[useAvailableVideos][ERROR] Authorization error accessing available videos:', result.error);
          return []; // Return empty array instead of throwing
        }
        
        // For other errors, throw normally
        console.error('[useAvailableVideos][ERROR] Error in query function:', result.error);
        throw result.error;
      }
      
      // Log the raw data before transformation
      console.log('[useAvailableVideos][DEBUG] Raw data before transformation:', {
        count: result.data?.length || 0,
        firstItem: result.data && result.data.length > 0 ? result.data[0] : null
      });
      
      // Transform API response to standardized Available Video type
      const transformedData = (result.data || []).map(mapAvailableVideoResponseToVideo);
      
      // Log the transformed data
      console.log('[useAvailableVideos][DEBUG] Transformed data:', {
        count: transformedData.length,
        firstItem: transformedData.length > 0 ? transformedData[0] : null
      });
      
      return transformedData;
    },
    ...options
  });
};

export default useAvailableVideos;
