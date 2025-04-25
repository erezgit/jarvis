import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayerBase } from './VideoPlayerBase';
import type { Video } from '@/core/services/videos';

interface VideoCardProps {
  /**
   * The video to display in the card
   */
  video: Video;
  
  /**
   * Additional CSS classes to apply to the card
   */
  className?: string;
  
  /**
   * Size of the video card
   * - 'default': 300px width
   * - 'large': 500px width
   */
  size?: 'default' | 'large';
  
  /**
   * Whether the card should be fully responsive (ignore max-width)
   * - When true: Card will expand to fill its container
   * - When false: Card will respect the max-width based on size
   */
  responsive?: boolean;

  /**
   * Whether to show the loading spinner when the video is loading
   * @default true
   */
  showLoadingSpinner?: boolean;
}

// Size constants to match VideoPlayerBase
const SIZES = {
  default: 300,
  large: 500,
} as const;

/**
 * VideoCard component
 * 
 * Displays a video with its metadata in a card format.
 * The card can be fixed-width or responsive based on the responsive prop.
 */
export function VideoCard({ 
  video, 
  className, 
  size = 'default',
  responsive = false,
  showLoadingSpinner = true
}: VideoCardProps) {
  // Get the exact width based on size for the VideoPlayerBase
  const width = SIZES[size];
  
  // Determine max-width class based on size
  const maxWidthClass = size === 'large' 
    ? 'max-w-[500px]' 
    : 'max-w-[300px]';

  return (
    <Card className={cn(
      'border-0 bg-transparent w-full', 
      responsive ? '' : maxWidthClass,
      className
    )}>
      <CardContent className="p-0">
        <VideoPlayerBase
          videoId={video.id}
          videoUrl={video.url}
          status={video.status}
          size={size}
          responsive={responsive}
          className={className}
          showLoadingSpinner={showLoadingSpinner}
        />
        {video.prompt && <p className="text-xs text-muted-foreground mt-2">{video.prompt}</p>}
      </CardContent>
    </Card>
  );
}
