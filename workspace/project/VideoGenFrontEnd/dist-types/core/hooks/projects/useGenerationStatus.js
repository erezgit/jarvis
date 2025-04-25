import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/core/services/projects';
/**
 * Hook for checking the status of a generation within a project
 * @param options Configuration options for the hook
 * @returns Query result containing generation status
 */
export function useGenerationStatus({ projectId, generationId, pollingInterval = 2000, enabled = true, }) {
    return useQuery({
        queryKey: ['generation-status', projectId, generationId],
        queryFn: async () => {
            const result = await projectService.checkGenerationStatus(projectId, generationId);
            if (result.error || !result.data) {
                throw result.error || new Error('Failed to get generation status');
            }
            return result.data;
        },
        enabled: enabled && Boolean(projectId) && Boolean(generationId),
        refetchInterval: (query) => {
            // Stop polling when generation is complete or failed
            if (query.state.data &&
                (query.state.data.status === 'completed' || query.state.data.status === 'failed')) {
                return false;
            }
            return pollingInterval;
        },
    });
}
