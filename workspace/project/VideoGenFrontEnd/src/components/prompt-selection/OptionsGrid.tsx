import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PromptOption } from '@/core/services/prompts/types';

interface OptionsGridProps {
  options: PromptOption[];
  selectedOption?: PromptOption;
  isLoading?: boolean;
  error?: Error | null;
  onSelect: (option: PromptOption) => void;
  className?: string;
}

export function OptionsGrid({
  options,
  selectedOption,
  isLoading = false,
  error = null,
  onSelect,
  className,
}: OptionsGridProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-[104px] h-[104px] rounded-md" />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (options.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No options available</div>;
  }

  // Sort options by displayOrder if available
  const sortedOptions = [...options].sort((a, b) => {
    // If both have displayOrder, sort by that
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
      return a.displayOrder - b.displayOrder;
    }
    // If only one has displayOrder, prioritize the one with displayOrder
    if (a.displayOrder !== undefined) return -1;
    if (b.displayOrder !== undefined) return 1;
    // Otherwise, sort by text
    return a.text.localeCompare(b.text);
  });

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3">
        {sortedOptions.map((option) => (
          <TooltipProvider key={option.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`
                    relative w-[104px] h-[104px] p-0 overflow-hidden group
                    border-2 hover:bg-transparent hover:border-primary
                    ${selectedOption?.id === option.id ? 'border-primary bg-transparent' : 'bg-transparent'}
                  `}
                  onClick={() => {
                    // Add debugging for dynamic options
                    if (option.category === 'dynamic') {
                      console.log('[OptionsGrid] DYNAMIC option selected:', JSON.stringify({
                        optionId: option.id,
                        optionText: option.text,
                        optionCategory: option.category,
                        isCurrentlySelected: selectedOption?.id === option.id
                      }));
                    }
                    onSelect(option);
                  }}
                >
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={option.text}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Handle image loading errors
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                    <span className="text-xs text-white bg-black/40 px-2 py-1 rounded-sm text-center leading-tight">
                      {option.text.length > 10 ? `${option.text.slice(0, 10)}...` : option.text}
                    </span>
                  </div>
                  {selectedOption?.id === option.id && (
                    <div className="absolute inset-0 bg-primary/20 border-2 border-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              {option.description && (
                <TooltipContent side="right" className="max-w-[200px]">
                  <p>{option.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
