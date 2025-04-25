import { DiscoveryServiceTypes } from './types';
import type { Video, VideoStatus } from '@/core/services/videos/types';

/**
 * Maps API response to standardized Video type
 * 
 * This mapper transforms the API response format to the standardized
 * Video type used throughout the UI components.
 */
export const mapDiscoveryResponseToVideo = (
  data: DiscoveryServiceTypes['DiscoveryItemResponse']
): DiscoveryServiceTypes['Video'] => {
  // Add detailed logging for debugging
  console.log('[mapDiscoveryResponseToVideo][DEBUG] Mapping discovery response:', {
    id: data.id,
    videoUrl: data.videoUrl,
    hasVideoUrl: !!data.videoUrl,
    videoUrlType: data.videoUrl ? typeof data.videoUrl : 'undefined',
    thumbnailUrl: data.thumbnailUrl,
    displayOrder: data.displayOrder,
    timestamp: new Date().toISOString()
  });
  
  const result = {
    id: data.id,
    url: data.videoUrl,  // Map videoUrl to url to match standard
    status: data.status,
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    displayOrder: data.displayOrder,
    createdAt: data.createdAt,
    generationId: data.generationId
  };
  
  // Log the mapped result
  console.log('[mapDiscoveryResponseToVideo][DEBUG] Mapped result:', {
    id: result.id,
    url: result.url,
    hasUrl: !!result.url,
    urlType: result.url ? typeof result.url : 'undefined',
    timestamp: new Date().toISOString()
  });
  
  return result;
};

/**
 * Maps API response to standardized Available Video type
 * 
 * This mapper transforms the API response format to the standardized
 * Available Video type used in the admin interface.
 */
export const mapAvailableVideoResponseToVideo = (
  data: DiscoveryServiceTypes['AvailableVideoResponse']
): DiscoveryServiceTypes['AvailableVideo'] => {
  console.log('[mapAvailableVideoResponseToVideo][DEBUG] Mapping video response:', {
    id: data.id,
    videoUrl: data.videoUrl,
    hasVideoUrl: !!data.videoUrl,
    videoUrlType: data.videoUrl ? typeof data.videoUrl : 'undefined',
    thumbnailUrl: data.thumbnailUrl,
    status: data.status,
    hasProjects: !!data.projects,
    projectTitle: data.projects?.title,
    timestamp: new Date().toISOString()
  });
  
  const result = {
    id: data.id,
    url: data.videoUrl,  // Map videoUrl to url to match standard
    thumbnailUrl: data.thumbnailUrl,
    status: data.status,
    duration: data.duration,
    createdAt: data.createdAt,
    projects: {
      title: data.projects?.title || 'Untitled Project',
    },
  };
  
  console.log('[mapAvailableVideoResponseToVideo][DEBUG] Mapped result:', {
    id: result.id,
    url: result.url,
    hasUrl: !!result.url,
    urlType: result.url ? typeof result.url : 'undefined',
    thumbnailUrl: result.thumbnailUrl,
    projectTitle: result.projects.title,
    timestamp: new Date().toISOString()
  });
  
  return result;
};

/**
 * Maps an array of API responses to standardized Video types
 */
export const mapDiscoveryResponsesToVideos = (
  data: DiscoveryServiceTypes['DiscoveryItemResponse'][]
): DiscoveryServiceTypes['Video'][] => {
  console.log('[mapDiscoveryResponsesToVideos][DEBUG] Mapping array of discovery responses:', {
    count: data.length,
    hasItems: data.length > 0,
    timestamp: new Date().toISOString()
  });
  
  return data.map(mapDiscoveryResponseToVideo);
};

/**
 * Maps an array of API responses to standardized Available Video types
 */
export const mapAvailableVideoResponsesToVideos = (
  data: DiscoveryServiceTypes['AvailableVideoResponse'][]
): DiscoveryServiceTypes['AvailableVideo'][] => {
  console.log('[mapAvailableVideoResponsesToVideos][DEBUG] Mapping array of available video responses:', {
    count: data.length,
    hasItems: data.length > 0,
    timestamp: new Date().toISOString()
  });
  
  return data.map(mapAvailableVideoResponseToVideo);
};

/**
 * Maps a Discovery Video to the common Video type
 * 
 * This mapper ensures compatibility with the common VideoCard component
 * by transforming the Discovery-specific video format to the common Video format.
 */
export const mapToCommonVideoType = (
  video: DiscoveryServiceTypes['Video']
): Video => {
  console.log('[mapToCommonVideoType][DEBUG] Mapping discovery video to common type:', {
    id: video.id,
    url: video.url,
    hasUrl: !!video.url,
    timestamp: new Date().toISOString()
  });
  
  const result: Video = {
    id: video.id,
    url: video.url,
    status: video.status as VideoStatus,
    prompt: '',  // Default empty prompt
    createdAt: video.createdAt,
    metadata: {
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration
    }
  };
  
  console.log('[mapToCommonVideoType][DEBUG] Mapped to common video type:', {
    id: result.id,
    url: result.url,
    hasUrl: !!result.url,
    hasThumbnail: !!result.metadata?.thumbnailUrl,
    timestamp: new Date().toISOString()
  });
  
  return result;
};

/**
 * Maps an array of Discovery Videos to the common Video type
 */
export const mapToCommonVideoTypes = (
  videos: DiscoveryServiceTypes['Video'][]
): Video[] => {
  console.log('[mapToCommonVideoTypes][DEBUG] Mapping array of discovery videos to common type:', {
    count: videos.length,
    hasItems: videos.length > 0,
    timestamp: new Date().toISOString()
  });
  
  return videos.map(mapToCommonVideoType);
};
