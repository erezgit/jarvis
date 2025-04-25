import React, { useEffect } from 'react';
import { VideoPlayerBase } from '@/components/video/VideoPlayerBase';
import { X } from 'lucide-react';
import { DiscoveryServiceTypes } from '@/core/services/discoveries/types';

interface StandardVideoPlayerModalProps {
  /**
   * The video to display in the modal
   */
  video: DiscoveryServiceTypes['Video'];
  
  /**
   * Callback function to close the modal
   */
  onClose: () => void;
}

/**
 * StandardVideoPlayerModal
 * 
 * A modal component for displaying videos in fullscreen mode.
 * Uses the standardized VideoPlayerBase component for consistent video playback.
 * 
 * This component is part of the standardization effort to ensure consistent
 * video playback experience across the application. It replaces the custom
 * VideoPlayerModal component with one that uses the common VideoPlayerBase.
 * 
 * @example
 * ```tsx
 * <StandardVideoPlayerModal
 *   video={selectedVideo}
 *   onClose={() => setSelectedVideo(null)}
 * />
 * ```
 */
export const StandardVideoPlayerModal: React.FC<StandardVideoPlayerModalProps> = ({
  video,
  onClose,
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
          aria-label="Close video"
        >
          <X size={24} />
        </button>
        
        <div className="bg-background rounded-lg overflow-hidden">
          <div className="aspect-video w-full">
            <VideoPlayerBase
              videoId={video.id}
              videoUrl={video.url}
              status="completed"
              size="large"
              responsive={false}
            />
          </div>
          
          {/* Video details */}
          <div className="p-4">
            <h3 className="text-lg font-medium">Featured Video</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(video.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardVideoPlayerModal; 