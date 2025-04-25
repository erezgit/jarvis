import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/core/services/projects';
/**
 * Hook for loading and managing project data
 * @param projectId The ID of the project to load
 * @returns Query result containing project data, loading state, and error handling
 */
export function useProject(projectId) {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            if (!projectId)
                throw new Error('Project ID is required');
            const result = await projectService.getProjectDetails(projectId);
            if (result.error || !result.data) {
                throw result.error || new Error('Project not found');
            }
            // Transform to view model
            return {
                id: result.data.id,
                name: result.data.name,
                description: result.data.description,
                imageUrl: result.data.imageUrl,
                status: result.data.status,
                videoCount: result.data.videoIds?.length || 0,
                lastUpdated: result.data.updatedAt,
            };
        },
        enabled: !!projectId,
    });
}
