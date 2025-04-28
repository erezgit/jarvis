import React from 'react';
import { PlayIcon } from 'lucide-react';
import { DiscoveryServiceTypes } from '@/core/services/discoveries/types';

// Helper function to format video duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface VideoCardProps {
  video: DiscoveryServiceTypes['Video'];  // Using standardized Video type
  onClick: () => void;
}

/**
 * VideoCard Component
 * 
 * Displays a video thumbnail with play button and duration.
 * Used in the Discovery page to display curated videos.
 */
export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="video-card cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" 
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <img 
          src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'} 
          alt="Video thumbnail" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-white/90 p-3">
            <PlayIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard; 