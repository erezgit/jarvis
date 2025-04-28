/**
 * Video generation domain types
 * Handles the specific types needed for the video generation process
 */

/**
 * Input type for video generation
 */
export interface VideoGenerationInput {
  projectId: string;
  prompt: string;
  metadata: {
    imageUrl: string;
    [key: string]: unknown;
  };
}

/**
 * Optional configuration for video generation
 */
export interface VideoGenerationOptions {
  resolution?: '720p' | '1080p';
  duration?: number;
  style?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response from the video generation API
 */
export interface VideoGenerationResponse {
  generationId: string;
  status: VideoGenerationStatus;
  error?: VideoGenerationError;
}

/**
 * Status of the video generation process
 */
export type VideoGenerationStatus =
  | 'queued' // Request is queued for processing
  | 'preparing' // System is preparing to generate the video
  | 'generating' // Video is being generated
  | 'processing' // Video is being processed post-generation
  | 'completed' // Video generation is complete (terminal state)
  | 'failed'; // Generation failed due to technical issues (terminal state)

/**
 * Error information for video generation
 */
export interface VideoGenerationError {
  name: string; // Required by Error interface
  code: VideoGenerationErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Specific error codes for video generation
 */
export type VideoGenerationErrorCode =
  | 'INVALID_IMAGE' // Image format/size/content invalid
  | 'INVALID_PROMPT' // Prompt empty or contains invalid content
  | 'GENERATION_FAILED' // Technical failure during generation
  | 'RATE_LIMIT_EXCEEDED' // Too many requests
  | 'INVALID_OPTIONS' // Invalid generation options
  | 'INSUFFICIENT_CREDITS' // Not enough credits to generate video
  | 'SERVICE_ERROR'; // Internal service error

/**
 * Progress information during generation
 */
export interface VideoGenerationProgress {
  status: VideoGenerationStatus;
  progress: number; // 0-100
  currentStep?: string; // Current processing step
  estimatedTimeRemaining?: number; // Seconds
}

/**
 * Final result of video generation
 */
export interface VideoGenerationResult {
  generationId: string;
  status: VideoGenerationStatus;
  videoUrl?: string; // URL to generated video if successful
  thumbnailUrl?: string; // URL to video thumbnail
  duration?: number; // Video duration in seconds
  metadata?: {
    resolution: string;
    format: string;
    size: number;
  };
  error?: VideoGenerationError;
}
