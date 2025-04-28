import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, PlayCircle } from 'lucide-react';
import type { VideoStatus } from '@/core/services/videos';
import { debugLog } from '@/lib/utils/debug';

interface VideoPlayerBaseProps {
  /**
   * Unique identifier for the video
   */
  videoId: string;
  
  /**
   * URL of the video to play
   */
  videoUrl: string | null;
  
  /**
   * Current status of the video
   */
  status?: VideoStatus;
  
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  
  /**
   * Size of the video player
   * - 'default': 300px width
   * - 'large': 500px width
   */
  size?: 'default' | 'large';
  
  /**
   * Whether the player should be fully responsive (ignore max-width)
   * - When true: Player will expand to fill its container
   * - When false: Player will respect the max-width based on size
   */
  responsive?: boolean;

  /**
   * Whether to show the loading spinner when the video is loading
   * @default true
   */
  showLoadingSpinner?: boolean;
}

const SIZES = {
  default: 300,
  large: 500,
} as const;

// Simple debug function
const logVideoPlayer = (videoId: string, message: string, data?: any) => {
  debugLog(`VideoPlayer:${videoId}`, message, data);
};

export function VideoPlayerBase({
  videoId,
  videoUrl,
  status = 'completed',
  className,
  size = 'default',
  responsive = false,
  showLoadingSpinner = true,
}: VideoPlayerBaseProps) {
  // Track playing and loading states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Single ref for video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calculate height based on 16:9 ratio
  const width = SIZES[size];
  const height = Math.round((width * 9) / 16);
  
  // Determine max-width class based on size
  const maxWidthClass = size === 'large' 
    ? 'max-w-[500px]' 
    : 'max-w-[300px]';

  // Log component mount
  useEffect(() => {
    logVideoPlayer(videoId, 'Component mounted', { 
      videoId,
      videoUrl, 
      status
    });
    
    // Reset loading state when video URL changes
    if (videoUrl) {
      setIsLoading(true);
    }
    
    return () => {
      logVideoPlayer(videoId, 'Component unmounting', { 
        videoId,
        videoUrl,
        status
      });
    };
  }, [videoId, videoUrl, status]);

  // Simple play/pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };
  
  // Download video
  const handleDownload = () => {
    if (!videoUrl) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${videoId}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Set up event listeners for video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Handle play/pause state
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    
    // Handle loading state
    const onCanPlayThrough = () => {
      logVideoPlayer(videoId, 'Video can play through', { videoId });
      setIsLoading(false);
    };
    
    const onLoadedData = () => {
      logVideoPlayer(videoId, 'Video data loaded', { videoId });
      setIsLoading(false);
    };
    
    // Handle errors
    const onError = () => {
      logVideoPlayer(videoId, 'Video error', { videoId, error: video.error });
      setIsLoading(false);
    };
    
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    
    // Set a safety timeout to hide spinner after 8 seconds max
    const safetyTimeout = setTimeout(() => {
      logVideoPlayer(videoId, 'Safety timeout reached', { videoId });
      setIsLoading(false);
    }, 8000);
    
    // Check if video is already loaded
    if (video.readyState >= 4) { // HAVE_ENOUGH_DATA
      setIsLoading(false);
    }
    
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      clearTimeout(safetyTimeout);
    };
  }, [videoId]);

  // Handle different states based on URL and status
  if (!videoUrl) {
    logVideoPlayer(videoId, 'Rendering no-URL state', { 
      videoId, 
      status
    });
    
    // For videos with no URL
    if (status === 'completed' || status === 'failed') {
      // Show placeholder for completed or failed videos with no URL
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center bg-muted rounded-lg w-full aspect-video",
            responsive ? '' : maxWidthClass
          )}
        >
          <PlayCircle className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {status === 'failed' ? 'Video generation failed' : 'No video available'}
          </p>
        </div>
      );
    } else {
      // Show spinner for videos still in progress
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-transparent rounded-lg w-full aspect-video",
            responsive ? '' : maxWidthClass
          )}
        >
          {showLoadingSpinner ? (
            <Spinner size="lg" className="text-muted-foreground" data-video-id={videoId} />
          ) : (
            <div className="w-8 h-8"></div> // Empty placeholder with same dimensions
          )}
        </div>
      );
    }
  }

  logVideoPlayer(videoId, 'Rendering video player', { 
    videoId, 
    isPlaying,
    isLoading
  });
  
  // Main video player with custom controls
  return (
    <div
      className={cn(
        "group relative bg-transparent rounded-lg overflow-hidden w-full aspect-video",
        responsive ? '' : maxWidthClass,
        className
      )}
      data-video-id={videoId}
      data-loading={isLoading}
    >
      {/* Video element - simple with no transitions */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        preload="auto"
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer rounded-lg bg-transparent"
      />
      
      {/* Loading spinner - simple conditional rendering */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
          <Spinner size="lg" className="text-muted-foreground" data-video-id={videoId} />
        </div>
      )}
      
      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={togglePlay}
          className="p-1 text-white hover:text-primary transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={handleDownload}
          className="p-1 text-white hover:text-primary transition-colors"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
