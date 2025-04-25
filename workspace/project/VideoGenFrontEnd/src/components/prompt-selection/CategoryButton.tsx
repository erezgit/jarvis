import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/core/services/prompts/types';

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  isLoading?: boolean;
  onSelect: (categoryId: string) => void;
  className?: string;
}

export function CategoryButton({
  category,
  isSelected,
  isLoading = false,
  onSelect,
  className,
}: CategoryButtonProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      className={cn(
        'w-full justify-start text-left font-normal',
        isSelected && 'bg-accent text-accent-foreground',
        className,
      )}
      onClick={() => onSelect(category.id)}
    >
      <span className="truncate">{category.name}</span>
      {isSelected && (
        <span className="ml-auto flex h-4 w-4 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-current" />
        </span>
      )}
    </Button>
  );
}
