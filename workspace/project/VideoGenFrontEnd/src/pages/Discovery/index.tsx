import React, { useState } from 'react';
import { useDiscoveries } from '@/core/services/discoveries/hooks/useDiscoveries';
import { VideoList } from '@/components/video/VideoList';
import { StandardVideoPlayerModal } from '@/components/discovery/StandardVideoPlayerModal';
import { DiscoveryServiceTypes } from '@/core/services/discoveries/types';
import type { Video } from '@/core/services/videos';
import { mapToCommonVideoTypes } from '@/core/services/discoveries/mappers';
import { PageHeader } from '@/components/common/PageHeader';
import { Spinner } from '@/components/common/Spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Discovery Page
 * 
 * Displays a curated list of videos from across all users/clients.
 * Users can view and play videos from this page.
 */
const DiscoveryPage: React.FC = () => {
  const { data: videos, isLoading, error } = useDiscoveries();
  const [selectedVideo, setSelectedVideo] = useState<DiscoveryServiceTypes['Video'] | null>(null);
  
  // Map discovery videos to the common Video type using the standardized mapper
  const mappedVideos: Video[] = videos ? mapToCommonVideoTypes(videos) : [];
  
  const handleVideoClick = (videoId: string) => {
    // Find the original discovery video to pass to the modal
    const originalVideo = videos?.find(v => v.id === videoId);
    if (originalVideo) {
      setSelectedVideo(originalVideo);
    }
  };
  
  const handleCloseModal = () => {
    setSelectedVideo(null);
  };
  
  // Custom click handler for VideoList
  const handleVideoCardClick = (video: Video) => {
    handleVideoClick(video.id);
  };
  
  if (isLoading) {
    return (
      <div className="h-full overflow-hidden flex flex-col">
        <div className="flex-none px-10 pt-6">
          <PageHeader title="Discovery" className="text-2xl font-bold tracking-tight" />
        </div>
        <div className="flex items-center justify-center flex-1">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-hidden flex flex-col">
        <div className="flex-none px-10 pt-6">
          <PageHeader title="Discovery" className="text-2xl font-bold tracking-tight" />
        </div>
        <div className="flex-1 px-10 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error.message}
              <button
                onClick={() => window.location.reload()}
                className="block w-full mt-2 text-sm underline hover:no-underline"
              >
                Try refreshing the page
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-none px-10 pt-6">
        <PageHeader title="Discovery" className="text-2xl font-bold tracking-tight" />
      </div>
      <div className="flex-1 overflow-auto px-10 py-6">
        <VideoList 
          videos={mappedVideos}
          isLoading={isLoading}
          error={error || null}
          layout="grid"
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          onVideoClick={handleVideoCardClick}
          responsive={true}
          showLoadingSpinner={false}
        />
      </div>
      
      {selectedVideo && (
        <StandardVideoPlayerModal 
          video={selectedVideo}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DiscoveryPage; 