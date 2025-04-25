import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../lib/services/base.service';
import { TYPES } from '../../lib/types';
import { StorageService } from './storage/service';
import { VideoRepository } from './db/repository';
import { 
  VideoProcessingError, 
  VideoStorageError,
  VideoValidationError 
} from './errors';
import { 
  ProcessingResult,
  ProcessingOptions,
  VideoMetadata,
  ProcessingStatusUpdate,
  DEFAULT_PROCESSING_OPTIONS,
  GenerationStatus
} from './types';
import { downloadVideo } from './storage/download';
import { ErrorCode } from '../../types/errors';
import { UploadFileParams, StorageResult } from '../../lib/storage/types';

@injectable()
export class VideoProcessingService extends BaseService {
  private retryDelays = [1000, 2000, 5000]; // Retry delays in ms

  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.StorageService) private readonly storageService: StorageService,
    @inject(TYPES.VideoRepository) private readonly repository: VideoRepository
  ) {
    super(logger, 'VideoProcessingService');
  }

  /**
   * Process a video from a given URL
   */
  async processVideo(
    url: string,
    metadata: VideoMetadata,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessingResult> {
    // Validate metadata
    if (!metadata || typeof metadata !== 'object' || 
        typeof metadata.generationId !== 'string' ||
        typeof metadata.projectId !== 'string' ||
        typeof metadata.userId !== 'string') {
      throw new VideoValidationError('Invalid video metadata');
    }

    // Create a type-safe metadata object with required fields
    const baseMetadata: VideoMetadata = {
      generationId: String(metadata.generationId),
      projectId: String(metadata.projectId),
      userId: String(metadata.userId),
      type: 'video',
      mimeType: metadata.mimeType || 'video/mp4',
      contentType: metadata.contentType || 'video/mp4',
      size: metadata.size || 0
    };

    try {
      this.logInfo('Starting video processing', {
        url,
        generationId: baseMetadata.generationId,
        options
      });

      const processingOptions: ProcessingOptions = {
        ...DEFAULT_PROCESSING_OPTIONS,
        ...options
      };

      // Download with retries
      const videoBuffer = await this.retryOperation(
        () => this.downloadVideo(url, DEFAULT_PROCESSING_OPTIONS.timeout),
        'video download'
      );

      // Update size in metadata
      baseMetadata.size = videoBuffer.length;

      // Validate video
      await this.validateVideo(videoBuffer, processingOptions);

      // Upload to storage
      const uploadResult = await this.retryOperation(
        () => this.uploadVideo(videoBuffer, { ...baseMetadata, ...metadata }),
        'video upload'
      );

      this.logInfo('Video processing completed', {
        generationId: baseMetadata.generationId,
        size: videoBuffer.length,
        path: uploadResult.path
      });

      return {
        success: true,
        videoUrl: uploadResult.url,
        metadata: {
          ...baseMetadata,
          ...metadata,
          size: videoBuffer.length,
          contentType: uploadResult.contentType
        }
      };

    } catch (error) {
      this.logError('Video processing failed', error);
      
      await this.updateProcessingStatus({
        generationId: String(baseMetadata.generationId),
        status: GenerationStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { ...baseMetadata, ...metadata }
      });

      throw new VideoProcessingError(
        'Failed to process video',
        { originalError: error }
      );
    }
  }

  /**
   * Update processing status
   */
  async updateProcessingStatus(params: {
    generationId: string;
    status: GenerationStatus;
    error?: string;
    metadata: VideoMetadata;
  }): Promise<void> {
    const { generationId, status, error, metadata } = params;
    
    await this.repository.updateGeneration(generationId, {
      ...metadata,
      status,
      error_message: error || undefined
    });
  }

  /**
   * Download video with timeout
   */
  private async downloadVideo(url: string, timeout: number): Promise<Buffer> {
    try {
      this.logInfo('Downloading video', { url, timeout });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new VideoProcessingError(
          `Failed to download video: ${response.statusText}`
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      this.logInfo('Video downloaded successfully', {
        url,
        size: buffer.length
      });

      return buffer;

    } catch (error) {
      this.logError('Video download failed', error);
      throw new VideoProcessingError(
        'Failed to download video',
        { originalError: error }
      );
    }
  }

  /**
   * Validate video content
   */
  private async validateVideo(
    buffer: Buffer,
    options: ProcessingOptions
  ): Promise<void> {
    try {
      this.logInfo('Validating video', {
        size: buffer.length,
        maxSize: options.maxSize
      });

      if (options.maxSize && buffer.length > options.maxSize) {
        throw new VideoValidationError(
          `Video size exceeds maximum allowed size of ${options.maxSize} bytes`
        );
      }

      // TODO: Add more validation (format, duration, dimensions)

    } catch (error) {
      this.logError('Video validation failed', error);
      throw new VideoValidationError(
        'Video validation failed',
        { originalError: error }
      );
    }
  }

  /**
   * Upload video to storage
   */
  private async uploadVideo(
    buffer: Buffer,
    metadata: VideoMetadata
  ): Promise<StorageResult & { contentType: string }> {
    try {
      this.logInfo('Uploading video', {
        generationId: metadata.generationId,
        size: buffer.length
      });

      const fileName = `video-${metadata.generationId}.mp4`;
      const uploadParams: UploadFileParams = {
        file: buffer,
        fileName,
        contentType: 'video/mp4',
        userId: String(metadata.userId),
        projectId: String(metadata.projectId),
        metadata: {
          type: 'video',
          mimeType: 'video/mp4',
          contentType: 'video/mp4',
          size: buffer.length,
          generationId: metadata.generationId,
          userId: metadata.userId,
          projectId: metadata.projectId,
          duration: metadata.duration,
          dimensions: metadata.dimensions,
          frameRate: metadata.frameRate,
          codec: metadata.codec,
          format: metadata.format,
          thumbnailUrl: metadata.thumbnailUrl
        }
      };

      const result = await this.storageService.uploadFile(uploadParams);
      return {
        ...result,
        contentType: 'video/mp4'
      };

    } catch (error) {
      this.logError('Video upload failed', error);
      throw new VideoStorageError(
        'Failed to upload video',
        { originalError: error }
      );
    }
  }

  /**
   * Retry an operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.retryDelays.length
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries - 1) {
          const delay = this.retryDelays[attempt];
          this.logInfo(`Retrying ${operationName}`, {
            attempt: attempt + 1,
            delay,
            error: lastError.message
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
  }

  protected logError(message: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(message, { error: errorMessage });
  }
} 