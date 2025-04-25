import { useVideoGeneration } from '@/core/hooks/video';
import { cn } from '@/lib/utils';
import type { Generation } from '@/core/services/projects';

interface VideoPlayerProps {
  videoId: string;
  className?: string;
  projectId?: string;
}

export function VideoPlayer({ videoId, className, projectId }: VideoPlayerProps) {
  const { videoUrl } = useVideoGeneration({ projectId });

  // Calculate height based on 16:9 ratio
  const width = 300;
  const height = Math.round((width * 9) / 16); // This will be 169px

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Video not found</p>
      </div>
    );
  }

  return (
    <div className="group relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <video
        src={videoUrl}
        controls
        className={cn(
          'w-full h-full object-cover rounded-lg [&::-webkit-media-controls-panel]:!bg-transparent',
          '[&::-webkit-media-controls-panel]:opacity-0 group-hover:[&::-webkit-media-controls-panel]:opacity-100',
          '[&::-webkit-media-controls-panel]:transition-opacity [&::-webkit-media-controls-panel]:duration-300',
          className,
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}
