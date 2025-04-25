import { cn } from '@/lib/utils';

interface ProjectsListSkeletonProps {
  className?: string;
  count?: number;
}

export function ProjectsListSkeleton({ className, count = 6 }: ProjectsListSkeletonProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse"
        >
          <div className="aspect-video bg-muted rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
