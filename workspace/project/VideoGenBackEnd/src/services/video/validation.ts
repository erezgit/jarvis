import { injectable, inject } from 'tsyringe';
import { BaseService } from '../../lib/services/base.service';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { GenerationStatus, ValidationResult, VideoMetadata } from './types';
import { VideoValidationError } from './errors';
import { ErrorCode } from './errors';

// Validation constants
const VALIDATION_RULES = {
  PROMPT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    FORBIDDEN_PATTERNS: [
      /<script>/i,
      /javascript:/i,
      /data:/i
    ]
  },
  VIDEO: {
    MAX_SIZE_MB: 100,
    MIN_DURATION_SEC: 1,
    MAX_DURATION_SEC: 300,
    MIN_DIMENSIONS: {
      WIDTH: 480,
      HEIGHT: 360
    },
    ALLOWED_CODECS: ['h264', 'vp8', 'vp9'] as const,
    ALLOWED_FORMATS: ['mp4', 'webm'] as const
  },
  STATUS: {
    VALID_TRANSITIONS: {
      [GenerationStatus.QUEUED]: [GenerationStatus.PREPARING, GenerationStatus.FAILED] as GenerationStatus[],
      [GenerationStatus.PREPARING]: [GenerationStatus.GENERATING, GenerationStatus.FAILED] as GenerationStatus[],
      [GenerationStatus.GENERATING]: [GenerationStatus.PROCESSING, GenerationStatus.FAILED] as GenerationStatus[],
      [GenerationStatus.PROCESSING]: [GenerationStatus.COMPLETED, GenerationStatus.FAILED] as GenerationStatus[],
      [GenerationStatus.COMPLETED]: [] as GenerationStatus[],
      [GenerationStatus.FAILED]: [] as GenerationStatus[]
    }
  }
} as const;

@injectable()
export class VideoValidationService extends BaseService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'video-validation');
  }

  /**
   * Validate generation request
   */
  validateGenerationRequest(
    projectId: string,
    prompt: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): ValidationResult {
    const errors: string[] = [];

    if (!projectId) {
      errors.push('Project ID is required');
    }

    if (!prompt) {
      errors.push('Prompt is required');
    } else if (prompt.length > 500) {
      errors.push('Prompt must be less than 500 characters');
    }

    if (!userId) {
      errors.push('User ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };
  }

  /**
   * Validate status transition
   */
  validateStatusTransition(
    currentStatus: GenerationStatus | null,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): ValidationResult {
    try {
      // Allow any initial status if current is null
      if (!currentStatus) {
        return { isValid: true };
      }

      const validTransitions = VALIDATION_RULES.STATUS.VALID_TRANSITIONS[currentStatus];
      if (!validTransitions.includes(newStatus)) {
        throw new VideoValidationError(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          { details: { currentStatus, newStatus } }
        );
      }

      // Validate metadata if provided
      if (metadata) {
        const metadataError = this.validateMetadata(metadata);
        if (metadataError) {
          throw new VideoValidationError(
            'Invalid metadata',
            { details: { error: metadataError } }
          );
        }
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof VideoValidationError) {
        return {
          isValid: false,
          error: error.message
        };
      }
      throw error;
    }
  }

  /**
   * Validate video URL
   */
  validateVideoUrl(url: string | null, metadata?: Record<string, unknown>): ValidationResult {
    try {
      if (!url) {
        throw new VideoValidationError('Video URL is required');
      }

      try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
          throw new VideoValidationError(
            'Invalid video URL protocol',
            { details: { url } }
          );
        }
      } catch {
        throw new VideoValidationError(
          'Invalid video URL format',
          { details: { url } }
        );
      }

      // Validate metadata if provided
      if (metadata) {
        const metadataError = this.validateMetadata(metadata);
        if (metadataError) {
          throw new VideoValidationError(
            'Invalid metadata',
            { details: { error: metadataError } }
          );
        }
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof VideoValidationError) {
        return {
          isValid: false,
          error: error.message
        };
      }
      throw error;
    }
  }

  /**
   * Validate video properties
   */
  validateVideoProperties(
    size: number,
    duration?: number,
    width?: number,
    height?: number,
    codec?: string
  ): ValidationResult {
    try {
      // Validate size
      const sizeInMB = size / (1024 * 1024);
      if (sizeInMB > VALIDATION_RULES.VIDEO.MAX_SIZE_MB) {
        throw new VideoValidationError(
          `Video size exceeds maximum allowed (${VALIDATION_RULES.VIDEO.MAX_SIZE_MB}MB)`,
          { details: { size: sizeInMB } }
        );
      }

      // Validate duration if provided
      if (duration !== undefined) {
        if (duration < VALIDATION_RULES.VIDEO.MIN_DURATION_SEC || 
            duration > VALIDATION_RULES.VIDEO.MAX_DURATION_SEC) {
          throw new VideoValidationError(
            `Invalid video duration (${VALIDATION_RULES.VIDEO.MIN_DURATION_SEC}-${VALIDATION_RULES.VIDEO.MAX_DURATION_SEC}s)`,
            { details: { duration } }
          );
        }
      }

      // Validate dimensions if provided
      if (width !== undefined && height !== undefined) {
        if (width < VALIDATION_RULES.VIDEO.MIN_DIMENSIONS.WIDTH || 
            height < VALIDATION_RULES.VIDEO.MIN_DIMENSIONS.HEIGHT) {
          throw new VideoValidationError(
            'Video dimensions too small',
            { details: { width, height, minimum: VALIDATION_RULES.VIDEO.MIN_DIMENSIONS } }
          );
        }
      }

      // Validate codec if provided
      if (codec && !VALIDATION_RULES.VIDEO.ALLOWED_CODECS.includes(codec as typeof VALIDATION_RULES.VIDEO.ALLOWED_CODECS[number])) {
        throw new VideoValidationError(
          'Unsupported video codec',
          { details: { codec, supported: VALIDATION_RULES.VIDEO.ALLOWED_CODECS } }
        );
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof VideoValidationError) {
        return {
          isValid: false,
          error: error.message
        };
      }
      throw error;
    }
  }

  /**
   * Validate metadata object
   */
  private validateMetadata(metadata: Record<string, any> | undefined): string {
    if (!metadata) {
      return '';
    }

    // Check for null/undefined values
    for (const [key, value] of Object.entries(metadata)) {
      if (value === null || value === undefined) {
        return `Metadata key '${key}' has null/undefined value`;
      }
    }

    // Check for circular references
    try {
      JSON.stringify(metadata);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('circular')) {
        return 'Metadata contains circular references';
      }
      throw error;
    }

    // Check nesting depth
    const checkNestingDepth = (obj: any, depth: number = 0): boolean => {
      if (depth > 5) return false;
      if (typeof obj !== 'object' || obj === null) return true;
      return Object.values(obj).every(val => checkNestingDepth(val, depth + 1));
    };

    if (!checkNestingDepth(metadata)) {
      return 'Metadata exceeds maximum nesting depth (5)';
    }

    return '';
  }

  /**
   * Validate and sanitize prompt
   */
  private validatePrompt(prompt: string): void {
    // Check length
    if (prompt.length < VALIDATION_RULES.PROMPT.MIN_LENGTH) {
      throw new VideoValidationError(
        `Prompt too short (minimum ${VALIDATION_RULES.PROMPT.MIN_LENGTH} characters)`,
        { details: { length: prompt.length } }
      );
    }

    if (prompt.length > VALIDATION_RULES.PROMPT.MAX_LENGTH) {
      throw new VideoValidationError(
        `Prompt too long (maximum ${VALIDATION_RULES.PROMPT.MAX_LENGTH} characters)`,
        { details: { length: prompt.length } }
      );
    }

    // Check for forbidden patterns
    for (const pattern of VALIDATION_RULES.PROMPT.FORBIDDEN_PATTERNS) {
      if (pattern.test(prompt)) {
        throw new VideoValidationError(
          'Prompt contains forbidden patterns',
          { details: { pattern: pattern.toString() } }
        );
      }
    }
  }
} 