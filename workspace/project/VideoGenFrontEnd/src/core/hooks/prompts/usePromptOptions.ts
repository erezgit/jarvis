import { useQuery } from '@tanstack/react-query';
import { promptService } from '@/core/services/prompts/service';
import type { PromptOption } from '@/core/services/prompts/types';

export function usePromptOptions(categoryId: string | null) {
  return useQuery<PromptOption[]>({
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
