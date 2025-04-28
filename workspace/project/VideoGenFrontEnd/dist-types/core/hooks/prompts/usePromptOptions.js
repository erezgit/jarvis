import { useQuery } from '@tanstack/react-query';
import { promptService } from '@/core/services/prompts/service';
export function usePromptOptions(categoryId) {
    return useQuery({
        queryKey: ['prompt-options', categoryId],
        queryFn: async () => {
            if (!categoryId) {
                return [];
            }
            const result = await promptService.getCategoryOptions(categoryId);
            if (result.error) {
                throw result.error;
            }
            return result.data || [];
        },
        enabled: !!categoryId, // Only fetch when categoryId is available
    });
}
