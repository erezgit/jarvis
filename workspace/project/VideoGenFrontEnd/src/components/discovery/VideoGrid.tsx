import React from 'react';

interface VideoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * VideoGrid Component
 * 
 * Displays a responsive grid of videos.
 * Used in the Discovery page to display curated videos.
 */
export const VideoGrid: React.FC<VideoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default VideoGrid; 