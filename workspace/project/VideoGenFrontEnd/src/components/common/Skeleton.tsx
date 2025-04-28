import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'video';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded-lg';

  const variantClasses = {
    default: 'h-4',
    card: 'aspect-video w-full',
    video: 'w-[300px] aspect-video',
  };

  return <div className={cn(baseClasses, variantClasses[variant], className)} />;
}
