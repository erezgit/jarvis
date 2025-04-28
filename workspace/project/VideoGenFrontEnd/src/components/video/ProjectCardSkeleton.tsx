import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';

interface ProjectCardSkeletonProps {
  className?: string;
}

export function ProjectCardSkeleton({ className }: ProjectCardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden border-0 bg-transparent', className)}>
      <CardContent className="p-0">
        <div className="flex gap-5">
          {/* Image Skeleton */}
          <div className="w-[300px] shrink-0">
            <Skeleton variant="card" />
            <Skeleton className="w-24 h-3 mt-2" />
          </div>

          {/* Video List Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="video" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
