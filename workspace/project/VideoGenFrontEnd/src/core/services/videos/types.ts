import type { Project } from '@/core/services/projects';

// Status types
export type VideoStatus =
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Standardized Video interface used throughout the UI components
 * This is the primary interface that should be used in all components
 */
export interface Video {
  id: string;
  url: string | null; // Consistent naming for video URL
  status: VideoStatus;
  prompt?: string;
  createdAt: string;
  metadata?: VideoMetadata;
}

/**
 * Video metadata interface
 */
export interface VideoMetadata {
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  [key: string]: unknown; // Allow for additional metadata properties
}

/**
 * Generation interface from API responses
 * This interface matches the structure returned by the API
 * Should be converted to Video type before use in components
 */
export interface VideoGeneration {
  id: string;
  videoUrl: string | null; // API response uses videoUrl
  status: VideoStatus;
  prompt?: string;
  createdAt: string;
  metadata?: VideoMetadata;
}

// Video generation types
export interface VideoGenerationOptions {
  prompt: string;
  imageUrl: string;
  projectId?: string;
}

export interface VideoGenerationResponse {
  generationId: string;
  success: boolean;
}

export interface VideoGenerationResult {
  generationId: string;
  projectId?: string;
  status: VideoStatus;
  videoUrl?: string;
  error?: string;
}

// API response types
export interface VideoResponse {
  data: Video;
}

export interface VideoListResponse {
  data: Video[];
  total: number;
}

export interface VideoStatusResponse {
  generationId: string;
  status: VideoStatus;
  progress?: number;
  videoUrl?: string;
  error?: string;
}

// Project-Video relationship types
export interface ProjectVideos {
  projectId: string;
  videos: Video[];
}

// Input types
export interface CreateVideoInput {
  prompt: string;
  imageUrl?: string;
  projectId?: string;
}

export interface UpdateVideoInput {
  status?: VideoStatus;
  url?: string | null;
  metadata?: Partial<VideoMetadata>;
}

// Hook types
export interface UseVideoGenerationOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: VideoGenerationResult) => void;
  onProjectUpdate?: (project: Project) => void;
  pollingInterval?: number;
}

/**
 * Type guard to check if an object is a VideoGeneration
 */
export function isVideoGeneration(obj: unknown): obj is VideoGeneration {
  return obj !== null && typeof obj === 'object' && 'videoUrl' in obj;
}

/**
 * Type guard to check if an object is a Video
 */
export function isVideo(obj: unknown): obj is Video {
  return obj !== null && typeof obj === 'object' && 'url' in obj;
}
