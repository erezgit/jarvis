import { useQuery } from '@tanstack/react-query';
import { promptService } from '@/core/services/prompts/service';
import type { Category, PromptOption } from '@/core/services/prompts/types';
import { useMemo } from 'react';

interface AllPromptData {
  categories: Category[];
  getOptionsForCategory: (categoryId: string) => PromptOption[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook that fetches all prompt categories and their options in a single API call
 * and provides methods to access the data efficiently.
 * 
 * This optimizes the user experience by:
 * 1. Making a single API call for all data
 * 2. Providing instant access to options when switching categories
 * 3. Caching the data for the entire session
 */
export function useAllPromptData(): AllPromptData {
  // Fetch all categories with their options in a single query
  const { 
    data: categories = [], 
    isLoading, 
    error 
  } = useQuery<Category[]>({
    queryKey: ['all-prompt-data'],
    queryFn: async () => {
      const result = await promptService.getCategories();
      if (result.error) {
        throw result.error;
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (formerly cacheTime)
  });

  // Create a memoized function to get options for a specific category
  const getOptionsForCategory = useMemo(() => {
    return (categoryId: string): PromptOption[] => {
      const category = (categories as Category[]).find(c => c.id === categoryId);
      return category?.options || [];
    };
  }, [categories]);

  return {
    categories: categories as Category[],
    getOptionsForCategory,
    isLoading,
    error: error as Error | null,
  };
} 