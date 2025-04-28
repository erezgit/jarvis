import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDiscoveries } from '@/core/services/discoveries/hooks/useDiscoveries';
import { useAvailableVideos } from '@/core/services/discoveries/hooks/useAvailableVideos';
import { useAddToDiscovery } from '@/core/services/discoveries/hooks/useAddToDiscovery';
import { useRemoveFromDiscovery } from '@/core/services/discoveries/hooks/useRemoveFromDiscovery';
import { useUpdateVideoOrder } from '@/core/services/discoveries/hooks/useUpdateVideoOrder';
import { DiscoveryServiceTypes } from '@/core/services/discoveries/types';
import { VideoCard } from '@/components/discovery/VideoCard';
import { VideoPlayerModal } from '@/components/discovery/VideoPlayerModal';
import { ArrowUp, ArrowDown, Plus, Trash2, RefreshCw, Play, Pause } from 'lucide-react';

// Define placeholder path for easier debugging
const PLACEHOLDER_THUMBNAIL = '/placeholder-thumbnail.jpg';

/**
 * Admin Discovery Page
 * 
 * Allows administrators to manage the videos displayed on the Discovery page.
 * Admins can add, remove, and reorder videos.
 */
const AdminDiscoveryPage: React.FC = () => {
  const { data: discoveryVideos, isLoading: isLoadingDiscovery, error: discoveryError, refetch: refetchDiscoveries } = useDiscoveries({
    onSuccess: (data) => {
      console.log('[AdminDiscoveryPage][RESPONSE_DATA] Discovery videos fetch succeeded:', {
        timestamp: new Date().toISOString(),
        count: data?.length || 0,
        isEmpty: !data || data.length === 0,
        data: data?.map(video => ({
          id: video.id,
          displayOrder: video.displayOrder,
          url: video.url ? `${video.url.substring(0, 30)}...` : 'undefined',
          thumbnailUrl: video.thumbnailUrl ? `${video.thumbnailUrl.substring(0, 30)}...` : 'undefined',
          hasValidUrl: !!video.url,
          hasValidThumbnail: !!video.thumbnailUrl
        }))
      });
    },
    onError: (error) => {
      console.error('[AdminDiscoveryPage][RESPONSE_ERROR] Discovery videos fetch failed:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  const { 
    data: availableVideos, 
    isLoading: isLoadingAvailable, 
    error: availableVideosError,
    refetch: refetchAvailableVideos
  } = useAvailableVideos({
    onSuccess: (data) => {
      console.log('[AdminDiscoveryPage][RESPONSE_DATA] Available videos fetch succeeded:', {
        timestamp: new Date().toISOString(),
        count: data?.length || 0,
        isEmpty: !data || data.length === 0,
        data: data?.slice(0, 3).map(video => ({
          id: video.id,
          url: video.url ? `${video.url.substring(0, 30)}...` : 'undefined',
          thumbnailUrl: video.thumbnailUrl ? `${video.thumbnailUrl.substring(0, 30)}...` : 'undefined',
          projectTitle: video.projects?.title,
          hasValidUrl: !!video.url,
          hasValidThumbnail: !!video.thumbnailUrl
        }))
      });
    },
    onError: (error) => {
      console.error('[AdminDiscoveryPage][RESPONSE_ERROR] Available videos fetch failed:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  const addToDiscovery = useAddToDiscovery();
  const removeFromDiscovery = useRemoveFromDiscovery();
  const updateVideoOrder = useUpdateVideoOrder();
  
  const [selectedVideo, setSelectedVideo] = useState<DiscoveryServiceTypes['Video'] | DiscoveryServiceTypes['AvailableVideo'] | null>(null);
  const [forceRender, setForceRender] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  // Force a re-render to help with debugging
  const handleForceRefresh = useCallback(() => {
    console.log('[AdminDiscoveryPage][DEBUG] Forcing refresh of data');
    refetchAvailableVideos();
    refetchDiscoveries();
    setForceRender(prev => prev + 1);
  }, [refetchAvailableVideos, refetchDiscoveries]);
  
  // Add logging for component state changes
  useEffect(() => {
    console.log('[AdminDiscoveryPage][DEBUG] discoveryVideos state updated:', {
      hasData: !!discoveryVideos,
      count: discoveryVideos?.length || 0,
      isLoading: isLoadingDiscovery,
      hasError: !!discoveryError,
      timestamp: new Date().toISOString()
    });
    
    // Log the raw discovery videos data for debugging
    if (discoveryVideos && discoveryVideos.length > 0) {
      console.log('[AdminDiscoveryPage][RAW_DATA] Discovery videos:', 
        discoveryVideos.map(video => ({
          id: video.id,
          displayOrder: video.displayOrder,
          url: video.url ? `${video.url.substring(0, 30)}...` : 'undefined',
          thumbnailUrl: video.thumbnailUrl ? `${video.thumbnailUrl.substring(0, 30)}...` : 'undefined',
          hasValidUrl: !!video.url,
          hasValidThumbnail: !!video.thumbnailUrl
        }))
      );
    } else {
      console.log('[AdminDiscoveryPage][RAW_DATA] Discovery videos: Empty or null array', {
        isNull: discoveryVideos === null,
        isUndefined: discoveryVideos === undefined,
        isEmpty: Array.isArray(discoveryVideos) && discoveryVideos.length === 0,
        timestamp: new Date().toISOString()
      });
    }
  }, [discoveryVideos, isLoadingDiscovery, discoveryError]);
  
  useEffect(() => {
    console.log('[AdminDiscoveryPage][DEBUG] availableVideos state updated:', {
      hasData: !!availableVideos,
      count: availableVideos?.length || 0,
      isLoading: isLoadingAvailable,
      hasError: !!availableVideosError,
      timestamp: new Date().toISOString(),
      firstItem: availableVideos && availableVideos.length > 0 ? {
        id: availableVideos[0].id,
        url: availableVideos[0].url,
        thumbnailUrl: availableVideos[0].thumbnailUrl,
        projectTitle: availableVideos[0].projects?.title
      } : null
    });
    
    // Log the first few available videos for debugging
    if (availableVideos && availableVideos.length > 0) {
      console.log('[AdminDiscoveryPage][RAW_DATA] First 3 available videos:', 
        availableVideos.slice(0, 3).map(video => ({
          id: video.id,
          url: video.url ? video.url.substring(0, 50) + '...' : 'undefined',
          thumbnailUrl: video.thumbnailUrl || 'null',
          placeholderPath: PLACEHOLDER_THUMBNAIL,
          hasValidUrl: !!video.url,
          hasValidThumbnail: !!video.thumbnailUrl
        }))
      );
    } else {
      console.log('[AdminDiscoveryPage][RAW_DATA] Available videos: Empty or null array', {
        isNull: availableVideos === null,
        isUndefined: availableVideos === undefined,
        isEmpty: Array.isArray(availableVideos) && availableVideos.length === 0,
        timestamp: new Date().toISOString()
      });
    }
  }, [availableVideos, isLoadingAvailable, availableVideosError, forceRender]);
  
  // Handle video play/pause
  const handleTogglePlay = useCallback((videoId: string, videoRef: React.RefObject<HTMLVideoElement>) => {
    if (playingVideoId === videoId) {
      // If this video is already playing, pause it
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    } else {
      // If another video is playing, pause it first
      if (playingVideoId && document.getElementById(`video-${playingVideoId}`) instanceof HTMLVideoElement) {
        (document.getElementById(`video-${playingVideoId}`) as HTMLVideoElement).pause();
      }
      
      // Play this video
      if (videoRef.current) {
        videoRef.current.play();
        setPlayingVideoId(videoId);
      }
    }
  }, [playingVideoId]);
  
  const handleVideoClick = (video: DiscoveryServiceTypes['Video'] | DiscoveryServiceTypes['AvailableVideo']) => {
    console.log('[AdminDiscoveryPage][DEBUG] Video clicked:', {
      id: video.id,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl
    });
    setSelectedVideo(video);
  };
  
  const handleCloseModal = () => {
    setSelectedVideo(null);
  };
  
  const handleAddToDiscovery = (video: DiscoveryServiceTypes['AvailableVideo']) => {
    console.log('[AdminDiscoveryPage][DEBUG] Adding video to discovery:', {
      id: video.id,
      url: video.url
    });
    addToDiscovery.mutate({
      generationId: video.id,
      displayOrder: discoveryVideos?.length || 0
    });
  };
  
  const handleRemoveFromDiscovery = (id: string) => {
    console.log('[AdminDiscoveryPage][DEBUG] Removing video from discovery:', { id });
    removeFromDiscovery.mutate(id);
  };
  
  const handleMoveUp = (video: DiscoveryServiceTypes['Video'], index: number) => {
    if (index === 0) return;
    
    console.log('[AdminDiscoveryPage][DEBUG] Moving video up:', {
      id: video.id,
      currentOrder: video.displayOrder,
      newOrder: video.displayOrder - 1
    });
    updateVideoOrder.mutate({
      id: video.id,
      request: { displayOrder: video.displayOrder - 1 }
    });
  };
  
  const handleMoveDown = (video: DiscoveryServiceTypes['Video'], index: number) => {
    if (!discoveryVideos || index === discoveryVideos.length - 1) return;
    
    console.log('[AdminDiscoveryPage][DEBUG] Moving video down:', {
      id: video.id,
      currentOrder: video.displayOrder,
      newOrder: video.displayOrder + 1
    });
    updateVideoOrder.mutate({
      id: video.id,
      request: { displayOrder: video.displayOrder + 1 }
    });
  };
  
  const isLoading = isLoadingDiscovery || isLoadingAvailable || 
                    addToDiscovery.isPending || removeFromDiscovery.isPending || 
                    updateVideoOrder.isPending;
  
  // Handle errors
  const hasError = !!discoveryError || !!availableVideosError || 
                  addToDiscovery.isError || removeFromDiscovery.isError || 
                  updateVideoOrder.isError;
  
  // Add logging for render
  console.log('[AdminDiscoveryPage][DEBUG] Rendering component with state:', {
    timestamp: new Date().toISOString(),
    isLoading,
    hasError,
    discoveryVideosCount: discoveryVideos?.length || 0,
    availableVideosCount: availableVideos?.length || 0,
    forceRender,
    discoveryError: discoveryError?.message,
    availableVideosError: availableVideosError?.message
  });
  
  // Video player component for inline display
  const InlineVideoPlayer = useCallback(({ video }: { video: DiscoveryServiceTypes['AvailableVideo'] }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isPlaying = playingVideoId === video.id;
    
    // Log video details for debugging
    console.log(`[InlineVideoPlayer][DEBUG] Rendering video player for video ID: ${video.id}`, {
      hasUrl: !!video.url,
      url: video.url || 'undefined',
      thumbnailUrl: video.thumbnailUrl || 'undefined',
      videoRef: videoRef.current ? 'initialized' : 'null'
    });
    
    return (
      <div className="relative w-full h-full">
        {video.url ? (
          <>
            <video
              id={`video-${video.id}`}
              ref={videoRef}
              src={video.url}
              className="w-full h-full object-cover rounded"
              preload="metadata"
              playsInline
              muted
              loop
              onError={(e) => console.error(`[InlineVideoPlayer][ERROR] Video failed to load:`, {
                videoId: video.id,
                url: video.url,
                error: e.currentTarget.error
              })}
            />
            <button 
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              onClick={() => handleTogglePlay(video.id, videoRef)}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
            <p className="text-gray-500 text-xs">No video URL</p>
          </div>
        )}
      </div>
    );
  }, [playingVideoId, handleTogglePlay]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Discovery Page</h1>
        <button 
          onClick={handleForceRefresh}
          className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh Data
        </button>
      </div>
      
      {isLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md">
          Processing...
        </div>
      )}
      
      {hasError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error occurred:</p>
          <p>{discoveryError?.message || availableVideosError?.message || 
              addToDiscovery.error?.message || removeFromDiscovery.error?.message || 
              updateVideoOrder.error?.message || 'Unknown error'}</p>
        </div>
      )}
      
      {/* Enhanced debug info panel */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Discovery Videos:</p>
            <p>Loading: {isLoadingDiscovery ? 'Yes' : 'No'}</p>
            <p>Error: {discoveryError ? discoveryError.message : 'None'}</p>
            <p>Count: {discoveryVideos?.length || 0}</p>
          </div>
          <div>
            <p className="font-medium">Available Videos:</p>
            <p>Loading: {isLoadingAvailable ? 'Yes' : 'No'}</p>
            <p>Error: {availableVideosError ? availableVideosError.message : 'None'}</p>
            <p>Count: {availableVideos?.length || 0}</p>
          </div>
        </div>
        <button 
          onClick={() => console.log('[AdminDiscoveryPage][DEBUG_DUMP] Current state:', { discoveryVideos, availableVideos })}
          className="mt-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
        >
          Log Full State to Console
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Discovery Videos */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Current Discovery Videos</h2>
          <div className="bg-white rounded-lg shadow p-4 overflow-auto max-h-[calc(100vh-200px)]">
            {discoveryVideos && discoveryVideos.length > 0 ? (
              <div className="space-y-4">
                {discoveryVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-100">
                    <div className="w-32 h-20 flex-shrink-0 mr-4">
                      <img 
                        src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover rounded"
                        onClick={() => handleVideoClick(video)}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium truncate">Video {index + 1}</p>
                      <p className="text-sm text-gray-500">Order: {video.displayOrder}</p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      <button 
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => handleMoveUp(video, index)}
                        disabled={index === 0}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => handleMoveDown(video, index)}
                        disabled={!discoveryVideos || index === discoveryVideos.length - 1}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <button 
                      className="ml-2 p-2 rounded bg-red-50 text-red-500 hover:bg-red-100"
                      onClick={() => handleRemoveFromDiscovery(video.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">No videos in discovery yet.</p>
                {discoveryError && (
                  <p className="text-red-500 mt-2">Error: {discoveryError.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Available Videos */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4">
            Available Videos 
            {availableVideos && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({availableVideos.length} videos)
              </span>
            )}
          </h2>
          
          {isLoadingAvailable ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">Loading available videos...</p>
            </div>
          ) : availableVideosError ? (
            <div className="bg-red-50 p-8 rounded-lg text-center">
              <p className="text-red-500">Error: {availableVideosError.message}</p>
            </div>
          ) : availableVideos && availableVideos.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-4 overflow-auto max-h-[calc(100vh-280px)]">
              <div className="space-y-4">
                {availableVideos.map((video) => (
                  <div key={video.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-100">
                    <div className="w-32 h-20 flex-shrink-0 mr-4 bg-gray-100 rounded overflow-hidden">
                      <InlineVideoPlayer video={video} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium truncate">
                        {video.projects?.title || 'Untitled Project'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                      {video.url && (
                        <p className="text-xs text-gray-400 truncate">
                          URL: {video.url.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                    <button 
                      className="ml-2 p-2 rounded bg-green-50 text-green-500 hover:bg-green-100"
                      onClick={() => handleAddToDiscovery(video)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No available videos found.</p>
              {availableVideosError && (
                <p className="text-red-500 mt-2">Error: {availableVideosError.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo as DiscoveryServiceTypes['Video']}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminDiscoveryPage; 