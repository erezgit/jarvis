import { useQuery } from '@tanstack/react-query';
import { promptService } from '@/core/services/prompts/service';
export function usePromptCategories() {
    return useQuery({
        queryKey: ['prompt-categories'],
        queryFn: async () => {
            const result = await promptService.getCategories();
            if (result.error) {
                throw result.error;
            }
            return result.data || [];
        },
    });
}
