import type { ApiError } from '@/core/types/api';
import type {
  VideoGenerationResponse,
  VideoGenerationResult,
  VideoGenerationProgress,
  VideoGenerationError,
  VideoGenerationStatus,
  VideoGenerationErrorCode,
} from './types';

// Define interfaces for raw API response data
interface RawVideoGenerationResponse {
  generationId?: string;
  generation_id?: string;
  status?: string;
  error?: unknown;
}

interface RawVideoGenerationProgress {
  status?: string;
  progress?: number;
  currentStep?: string;
  current_step?: string;
  estimatedTimeRemaining?: number;
  estimated_time_remaining?: number;
}

interface RawVideoGenerationResult {
  generationId?: string;
  generation_id?: string;
  status?: string;
  videoUrl?: string;
  video_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: unknown;
  metadata?: {
    resolution?: string;
    format?: string;
    size?: number;
    [key: string]: unknown;
  };
}

/**
 * Mapper class for video generation responses
 * Handles transformation of API responses to domain types
 */
export class VideoGenerationMapper {
  /**
   * Maps raw API response to VideoGenerationResponse
   */
  static toResponse(data: unknown): VideoGenerationResponse {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response data');
    }

    const response = data as RawVideoGenerationResponse;
    return {
      generationId: response.generationId || response.generation_id || '',
      status: VideoGenerationMapper.mapStatus(response.status || ''),
      error: response.error ? VideoGenerationMapper.toError(response.error) : undefined,
    };
  }

  /**
   * Maps raw API response to VideoGenerationProgress
   */
  static toProgress(data: unknown): VideoGenerationProgress {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid progress data');
    }

    const progress = data as RawVideoGenerationProgress;
    return {
      status: VideoGenerationMapper.mapStatus(progress.status || ''),
      progress: progress.progress || 0,
      currentStep: progress.currentStep || progress.current_step,
      estimatedTimeRemaining: progress.estimatedTimeRemaining || progress.estimated_time_remaining,
    };
  }

  /**
   * Maps raw API response to VideoGenerationResult
   */
  static toResult(data: unknown): VideoGenerationResult {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid result data');
    }

    const result = data as RawVideoGenerationResult;
    
    // Create metadata with required fields if available
    let metadata = undefined;
    if (result.metadata) {
      // Ensure all required fields have non-undefined values
      const resolution = result.metadata.resolution || 'unknown';
      const format = result.metadata.format || 'mp4';
      const size = result.metadata.size || 0;
      
      metadata = {
        resolution,
        format,
        size
      };
    }
    
    return {
      generationId: result.generationId || result.generation_id || '',
      status: VideoGenerationMapper.mapStatus(result.status || ''),
      videoUrl: result.videoUrl || result.video_url,
      thumbnailUrl: result.thumbnailUrl || result.thumbnail_url,
      duration: result.duration,
      metadata,
      error: result.error ? VideoGenerationMapper.toError(result.error) : undefined,
    };
  }

  /**
   * Maps API error to VideoGenerationError
   */
  static toError(error: unknown): VideoGenerationError {
    if (error instanceof Error) {
      return {
        name: 'VideoGenerationError',
        code: 'SERVICE_ERROR',
        message: error.message,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'VideoGenerationError',
        code: 'SERVICE_ERROR',
        message: error,
      };
    }

    // Handle API error response
    if (this.isApiError(error)) {
      return {
        name: 'VideoGenerationError',
        code: VideoGenerationMapper.mapErrorCode(error.code),
        message: error.message,
        details: {
          status: error.status,
          code: error.code,
          message: error.message,
        },
      };
    }

    // Default error
    return {
      name: 'VideoGenerationError',
      code: 'SERVICE_ERROR',
      message: 'Unknown error occurred',
    };
  }

  /**
   * Maps API status to VideoGenerationStatus
   */
  private static mapStatus(status: string): VideoGenerationStatus {
    // Normalize the status to lowercase for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';

    // Check if the status is one of our valid statuses
    if (
      normalizedStatus === 'queued' ||
      normalizedStatus === 'preparing' ||
      normalizedStatus === 'generating' ||
      normalizedStatus === 'processing' ||
      normalizedStatus === 'completed' ||
      normalizedStatus === 'failed'
    ) {
      return normalizedStatus as VideoGenerationStatus;
    }

    // For backward compatibility or unknown statuses
    // Map to the closest matching status
    if (normalizedStatus === 'accepted') return 'queued';
    if (normalizedStatus === 'rejected') return 'failed';

    // Default to 'processing' for any unknown status
    console.warn(`Unknown video generation status: ${status}`);
    return 'processing';
  }

  /**
   * Maps API error code to VideoGenerationErrorCode
   */
  private static mapErrorCode(code?: string): VideoGenerationErrorCode {
    switch (code?.toUpperCase()) {
      case 'INVALID_IMAGE':
        return 'INVALID_IMAGE';
      case 'INVALID_PROMPT':
        return 'INVALID_PROMPT';
      case 'GENERATION_FAILED':
        return 'GENERATION_FAILED';
      case 'RATE_LIMIT_EXCEEDED':
        return 'RATE_LIMIT_EXCEEDED';
      case 'INVALID_OPTIONS':
        return 'INVALID_OPTIONS';
      case 'TOKEN/INSUFFICIENT-BALANCE':
      case 'INSUFFICIENT_BALANCE':
      case 'INSUFFICIENT_CREDITS':
        return 'INSUFFICIENT_CREDITS';
      default:
        return 'SERVICE_ERROR';
    }
  }

  /**
   * Type guard for API error
   */
  private static isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
  }
}
