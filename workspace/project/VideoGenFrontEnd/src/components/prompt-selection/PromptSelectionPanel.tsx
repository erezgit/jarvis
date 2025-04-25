import { cn } from '@/lib/utils';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { useAllPromptData } from '@/core/hooks/prompts';
import { OptionsGrid } from './OptionsGrid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

interface PromptSelectionPanelProps {
  className?: string;
}

export function PromptSelectionPanel({ className }: PromptSelectionPanelProps) {
  // Get selection state and actions from context
  const {
    state,
    isLoading: contextLoading,
    error: contextError,
    selectCategory,
    selectOption,
  } = usePromptSelection();

  console.log('[PromptSelectionPanel] state:', JSON.stringify({
    selectedCategory: state.selectedCategory,
    hasSelectedOptions: Object.keys(state.selectedOptions).length > 0,
  }));

  // Use the new hook that fetches all data at once
  const {
    categories,
    getOptionsForCategory,
    isLoading: dataLoading,
    error: dataError,
  } = useAllPromptData();

  // Ensure a category is selected if none is selected
  useEffect(() => {
    if (!state.selectedCategory && categories.length > 0 && !dataLoading) {
      console.log('[PromptSelectionPanel] No category selected, selecting first category:', categories[0].id);
      selectCategory(categories[0].id);
    }
  }, [categories, state.selectedCategory, dataLoading, selectCategory]);

  // Get options for the selected category
  const options = state.selectedCategory ? getOptionsForCategory(state.selectedCategory) : [];

  console.log('[PromptSelectionPanel] options:', JSON.stringify({
    count: options.length,
    isLoading: dataLoading,
    hasError: !!dataError,
    categoryId: state.selectedCategory,
  }));

  // Show error if any
  const error = contextError || dataError;
  if (error) {
    console.error('[PromptSelectionPanel] Error:', error.message);
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // If no category is selected and data is still loading, show loading state
  if (!state.selectedCategory && (dataLoading || contextLoading)) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-sm text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  // If no category is selected and data is loaded, show a message
  if (!state.selectedCategory && categories.length > 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-sm text-muted-foreground">Select a category to see options</div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Options */}
      {state.selectedCategory ? (
        <OptionsGrid
          options={options}
          selectedOption={state.selectedOptions[state.selectedCategory]}
          isLoading={dataLoading || contextLoading}
          error={error}
          onSelect={selectOption}
        />
      ) : (
        <div className="text-sm text-muted-foreground">Select a category to see options</div>
      )}
    </div>
  );
}
