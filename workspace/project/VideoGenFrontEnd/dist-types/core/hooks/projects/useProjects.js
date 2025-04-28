import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/core/services/projects';
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const result = await projectService.getAllProjects();
            if (result.error) {
                throw result.error;
            }
            return result.data || [];
        },
    });
}
