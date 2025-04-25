import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PromptPresetsProps {
  onSelect: (preset: string) => void;
  className?: string;
}

export function PromptPresets({ onSelect, className }: PromptPresetsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <Button variant="outline" className="flex-1" onClick={() => onSelect('static short')}>
        Static
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => onSelect('motion short')}>
        Motion
      </Button>
    </div>
  );
}
