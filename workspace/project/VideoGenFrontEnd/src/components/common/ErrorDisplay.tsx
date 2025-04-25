import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error?: Error | null;
  className?: string;
  message?: string;
}

export function ErrorDisplay({
  error,
  className,
  message = 'Something went wrong',
}: ErrorDisplayProps) {
  const errorMessage = error?.message || message;

  return (
    <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{errorMessage}</p>
      </div>
    </div>
  );
}
