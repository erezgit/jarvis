import { VideoCard } from './VideoCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import type { Video } from '@/core/services/videos';
import { Spinner } from '@/components/common/Spinner';
import { useState, useEffect, useRef } from 'react';

interface VideoListProps {
  /**
   * Array of videos to display
   */
  videos: Video[];
  
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  
  /**
   * Size of the video cards
   * - 'default': 300px width
   * - 'large': 500px width
   */
  size?: 'default' | 'large';
  
  /**
   * Layout of the video list
   * - 'grid': Display videos in a grid
   * - 'stack': Display videos in a vertical stack
   */
  layout?: 'grid' | 'stack';
  
  /**
   * Mode of the video list
   * - 'new': For new video creation
   * - 'edit': For editing existing videos
   */
  mode?: 'new' | 'edit';
  
  /**
   * Whether the list is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Error to display if loading failed
   */
  error?: Error | null;
  
  /**
   * Callback when a video is clicked
   */
  onVideoClick?: (video: Video) => void;
  
  /**
   * Whether the video cards should be fully responsive
   * - When true: Cards will expand to fill their container
   * - When false: Cards will respect their max-width based on size
   */
  responsive?: boolean;

  /**
   * Whether to show the loading spinner when videos are loading
   * @default true
   */
  showLoadingSpinner?: boolean;
}

// Safety timeout to prevent infinite spinner
const SAFETY_TIMEOUT = 8000; // 8 seconds

/**
 * VideoList component
 * 
 * Displays a list of videos in either a grid or stack layout.
 * Handles loading states, errors, and empty states.
 */
export function VideoList({
  videos = [],
  className,
  size = 'default',
  layout = 'grid',
  mode = 'new',
  isLoading = false,
  error = null,
  onVideoClick,
  responsive = false,
  showLoadingSpinner = true,
}: VideoListProps) {
  // Initialize showSpinner based on both isLoading and showLoadingSpinner
  const [showSpinner, setShowSpinner] = useState(isLoading && showLoadingSpinner);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Update spinner visibility when isLoading or showLoadingSpinner props change
  useEffect(() => {
    // Clear any existing safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    
    if (isLoading && showLoadingSpinner) {
      setShowSpinner(true);
      
      // Set a safety timeout to prevent infinite spinner
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn('[VideoList] Safety timeout reached, hiding spinner');
        setShowSpinner(false);
      }, SAFETY_TIMEOUT);
    } else {
      setShowSpinner(false);
    }
    
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [isLoading, showLoadingSpinner]); // Add showLoadingSpinner to dependencies

  if (showSpinner) {
    return (
      <div className="flex items-center justify-center min-h-[169px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Show placeholder for new projects or when no videos exist
  if (!videos.length) {
    return (
      <div className="flex justify-center">
        <div
          className={cn('flex flex-col items-center justify-center bg-muted rounded-lg', className)}
          style={{
            width: size === 'large' ? '500px' : '300px',
            height: '169px',
          }}
        >
          <div className="text-center">
            <PlayCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {mode === 'new' ? 'Your video will appear here' : 'No videos generated yet'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort videos by creation date (newest first)
  const sortedVideos = [...videos].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className={cn(
      layout === 'grid' ? 'grid gap-5' : 'space-y-5', 
      className
    )}>
      {sortedVideos.map((video) => (
        <div 
          key={video.id} 
          className={onVideoClick ? 'cursor-pointer' : undefined}
          onClick={onVideoClick ? () => onVideoClick(video) : undefined}
        >
          <VideoCard 
            key={video.id} 
            video={video} 
            size={size} 
            responsive={responsive}
            showLoadingSpinner={showLoadingSpinner}
          />
        </div>
      ))}
    </div>
  );
}
