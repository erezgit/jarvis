import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/core/services/projects';
import { projectService } from '@/core/services/projects';

export function useProjectDetails(projectId: string | null) {
  return useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const result = await projectService.getProjectDetails(projectId);
      if (result.error || !result.data) {
        throw result.error || new Error('Project not found');
      }
      return result.data;
    },
    enabled: !!projectId,
  });
}
