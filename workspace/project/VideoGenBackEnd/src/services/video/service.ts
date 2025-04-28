import { injectable, inject } from 'tsyringe';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { VideoRepository } from './db/repository';
import { RunwayClient } from './runway/client';
import { BaseService } from '../../lib/services/base.service';
import { IVideoService } from './types';
import {
  VideoGenerationRequest,
  VideoGenerationResult,
  VideoGenerationStatus,
  DbGeneration,
  GenerationStatus,
  StatusChangeEvent,
  ErrorEvent,
  VideoEvents
} from './types';
import { VideoError, VideoNotFoundError, VideoAccessError } from './errors';
import { ErrorCode } from './errors';

@injectable()
export class VideoService extends EventEmitter implements IVideoService {
  private readonly serviceName = 'VideoService';

  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.VideoRepository) private readonly repository: VideoRepository,
    @inject(TYPES.RunwayClient) private readonly runwayClient: RunwayClient
  ) {
    super();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.on('error', (error: Error) => {
      this.logger.error(`[${this.serviceName}] Unhandled error`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  async startGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    try {
      this.logger.info(`[${this.serviceName}] Starting video generation`, {
        userId: request.userId,
        timestamp: new Date().toISOString()
      });

      // Convert request to metadata
      const metadata: Record<string, unknown> = {
        userId: request.userId,
        prompt: request.prompt,
        projectId: request.projectId,
        createdAt: new Date().toISOString()
      };

      const { data: generation, error } = await this.repository.createGeneration({
        user_id: request.userId,
        project_id: request.projectId,
        prompt: request.prompt,
        status: GenerationStatus.QUEUED,
        metadata
      });

      if (error || !generation) {
        throw new VideoError(
          ErrorCode.VIDEO_GENERATION_FAILED,
          'Failed to create generation record'
        );
      }

      // Emit status change event
      this.emitStatusChange({
        generationId: generation.id,
        fromStatus: GenerationStatus.QUEUED,
        toStatus: GenerationStatus.QUEUED,
        timestamp: new Date().toISOString(),
        metadata
      });

      return {
        success: true,
        generationId: generation.id
      };

    } catch (error) {
      this.logger.error(`[${this.serviceName}] Generation failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        timestamp: new Date().toISOString()
      });

      // Convert request to metadata for error event
      const metadata: Record<string, unknown> = {
        userId: request.userId,
        prompt: request.prompt,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.emitError({
        generationId: 'unknown',
        status: GenerationStatus.FAILED,
        error: error instanceof Error ? error : new Error('Unknown error'),
        timestamp: new Date().toISOString(),
        metadata
      });

      throw error;
    }
  }

  async getGenerationStatus(generationId: string, userId: string): Promise<VideoGenerationStatus> {
    try {
      const { data: generation, error } = await this.repository.getGeneration(generationId);

      if (error) {
        throw error;
      }

      if (!generation) {
        throw new VideoNotFoundError(generationId);
      }

      if (generation.user_id !== userId) {
        throw new VideoAccessError(generationId, userId);
      }

      return {
        status: generation.status,
        videoUrl: generation.video_url,
        error: generation.error_message,
        metadata: generation.metadata
      };

    } catch (error) {
      this.logger.error(`[${this.serviceName}] Failed to get generation status`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async updateGenerationStatus(
    generationId: string,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: generation, error } = await this.repository.getGeneration(generationId);

      if (error) {
        throw error;
      }

      if (!generation) {
        throw new VideoNotFoundError(generationId);
      }

      const oldStatus = generation.status;

      const { error: updateError } = await this.repository.updateGeneration(generationId, {
        status: newStatus,
        metadata: { ...generation.metadata, ...metadata }
      });

      if (updateError) {
        throw updateError;
      }

      // Emit status change event
      this.emitStatusChange({
        generationId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        timestamp: new Date().toISOString(),
        metadata
      });

    } catch (error) {
      this.logger.error(`[${this.serviceName}] Failed to update generation status`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        newStatus,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  onStatusChange(listener: (event: StatusChangeEvent) => void): void {
    this.on(VideoEvents.STATUS_CHANGE, listener);
  }

  onError(listener: (event: ErrorEvent) => void): void {
    this.on(VideoEvents.ERROR, listener);
  }

  onCompleted(listener: (event: StatusChangeEvent) => void): void {
    this.on(VideoEvents.COMPLETED, listener);
  }

  onFailed(listener: (event: ErrorEvent) => void): void {
    this.on(VideoEvents.FAILED, listener);
  }

  private emitStatusChange(event: StatusChangeEvent): void {
    this.emit(VideoEvents.STATUS_CHANGE, event);
    
    if (event.toStatus === GenerationStatus.COMPLETED) {
      this.emit(VideoEvents.COMPLETED, event);
    }
  }

  private emitError(event: ErrorEvent): void {
    this.emit(VideoEvents.ERROR, event);
    this.emit(VideoEvents.FAILED, event);
  }
} 