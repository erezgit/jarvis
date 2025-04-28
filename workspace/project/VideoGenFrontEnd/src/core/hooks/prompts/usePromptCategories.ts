import { useQuery } from '@tanstack/react-query';
import { promptService } from '@/core/services/prompts/service';
import type { Category } from '@/core/services/prompts/types';

export function usePromptCategories() {
  return useQuery<Category[]>({
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
