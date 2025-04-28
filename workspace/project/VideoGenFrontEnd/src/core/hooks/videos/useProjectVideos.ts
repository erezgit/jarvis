import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/core/services/videos';
import type { VideoViewModel } from './types';

/**
 * Hook for loading and managing videos associated with a project
 * @param projectId The ID of the project to load videos for
 * @returns Query result containing video data, loading state, and error handling
 */
export function useProjectVideos(projectId: string | null) {
  return useQuery<VideoViewModel[]>({
    queryKey: ['project-videos', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const result = await videoService.getVideos({ projectId });
      if (result.error || !result.data) {
        throw result.error || new Error('Failed to load project videos');
      }

      // Transform to view models
      return result.data.map((video) => ({
        id: video.id,
        url: video.url,
        status: video.status,
        thumbnailUrl: video.metadata?.thumbnailUrl,
        duration: video.metadata?.duration,
        createdAt: video.createdAt,
      }));
    },
    enabled: !!projectId,
  });
}
