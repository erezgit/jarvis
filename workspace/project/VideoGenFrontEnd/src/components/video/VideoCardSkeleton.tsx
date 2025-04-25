import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';

interface VideoCardSkeletonProps {
  className?: string;
  size?: 'default' | 'large';
}

export function VideoCardSkeleton({ className, size = 'default' }: VideoCardSkeletonProps) {
  return (
    <Card className={cn('w-fit border-0 bg-transparent', className)}>
      <CardContent className="p-0">
        <div>
          <div className="relative">
            <Skeleton
              variant="video"
              className={cn(size === 'large' ? 'w-[500px] h-[281px]' : 'w-[300px] h-[169px]')}
            />
          </div>
          <Skeleton className="w-3/4 h-3 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
