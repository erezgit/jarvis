import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { DiscoveryServiceTypes } from '@/core/services/discoveries/types';

interface VideoPlayerModalProps {
  video: DiscoveryServiceTypes['Video'];
  onClose: () => void;
}

/**
 * VideoPlayerModal Component
 * 
 * Displays a modal with a video player.
 * Used in the Discovery page to play videos.
 */
export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Pause video when closing modal
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4"
      >
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <div className="aspect-video w-full">
          {video.url ? (
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full rounded-t-lg"
              controls
              autoPlay
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
              <p className="text-gray-500">Video not available</p>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Video Details</h3>
          <p className="text-sm text-gray-600">
            Status: {video.status}
          </p>
          <p className="text-sm text-gray-600">
            Created: {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal; 