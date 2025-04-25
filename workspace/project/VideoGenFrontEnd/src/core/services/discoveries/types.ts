import { VideoStatus } from '@/core/services/videos/types';

/**
 * Discovery Service Types
 * 
 * This file contains all types related to the Discovery service.
 * It follows the standardized pattern of separating API response types
 * from the standardized types used in the UI.
 */
export interface DiscoveryServiceTypes {
  // API response type (matches backend)
  DiscoveryItemResponse: {
    id: string;
    generationId: string;
    videoUrl: string;
    thumbnailUrl: string;
    status: VideoStatus;
    duration: number;
    displayOrder: number;
    createdAt: string;
  };
  
  // Standardized Video type (matches project standard)
  Video: {
    id: string;
    url: string;  // Note: renamed from videoUrl to match standard
    status: VideoStatus;
    thumbnailUrl: string;
    duration: number;
    displayOrder: number;
    createdAt: string;
    generationId: string;
  };
  
  // Available video response from API
  AvailableVideoResponse: {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    status: VideoStatus;
    duration: number;
    createdAt: string;
    projects: {
      title: string;
    };
  };
  
  // Standardized Available Video type
  AvailableVideo: {
    id: string;
    url: string;  // Note: renamed from videoUrl to match standard
    thumbnailUrl: string;
    status: VideoStatus;
    duration: number;
    createdAt: string;
    projects: {
      title: string;
    };
  };
  
  // Request types
  AddToDiscoveryRequest: {
    generationId: string;
    displayOrder?: number;
  };
  
  UpdateOrderRequest: {
    displayOrder: number;
  };
}

/**
 * Type guard to check if an object is a DiscoveryItemResponse
 */
export function isDiscoveryItemResponse(obj: unknown): obj is DiscoveryServiceTypes['DiscoveryItemResponse'] {
  return obj !== null && typeof obj === 'object' && 'videoUrl' in obj && 'displayOrder' in obj;
}

/**
 * Type guard to check if an object is a standardized Discovery Video
 */
export function isDiscoveryVideo(obj: unknown): obj is DiscoveryServiceTypes['Video'] {
  return obj !== null && typeof obj === 'object' && 'url' in obj && 'displayOrder' in obj;
}
