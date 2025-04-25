/**
 * Mapper class for video generation responses
 * Handles transformation of API responses to domain types
 */
export class VideoGenerationMapper {
    /**
     * Maps raw API response to VideoGenerationResponse
     */
    static toResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response data');
        }
        const response = data;
        return {
            generationId: response.generationId || response.generation_id || '',
            status: VideoGenerationMapper.mapStatus(response.status || ''),
            error: response.error ? VideoGenerationMapper.toError(response.error) : undefined,
        };
    }
    /**
     * Maps raw API response to VideoGenerationProgress
     */
    static toProgress(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid progress data');
        }
        const progress = data;
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
    static toResult(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid result data');
        }
        const result = data;
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
    static toError(error) {
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
    static mapStatus(status) {
        // Normalize the status to lowercase for case-insensitive comparison
        const normalizedStatus = status?.toLowerCase() || '';
        // Check if the status is one of our valid statuses
        if (normalizedStatus === 'queued' ||
            normalizedStatus === 'preparing' ||
            normalizedStatus === 'generating' ||
            normalizedStatus === 'processing' ||
            normalizedStatus === 'completed' ||
            normalizedStatus === 'failed') {
            return normalizedStatus;
        }
        // For backward compatibility or unknown statuses
        // Map to the closest matching status
        if (normalizedStatus === 'accepted')
            return 'queued';
        if (normalizedStatus === 'rejected')
            return 'failed';
        // Default to 'processing' for any unknown status
        console.warn(`Unknown video generation status: ${status}`);
        return 'processing';
    }
    /**
     * Maps API error code to VideoGenerationErrorCode
     */
    static mapErrorCode(code) {
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
            default:
                return 'SERVICE_ERROR';
        }
    }
    /**
     * Type guard for API error
     */
    static isApiError(error) {
        return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
    }
}
