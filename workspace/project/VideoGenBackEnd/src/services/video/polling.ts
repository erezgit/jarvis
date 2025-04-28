import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../lib/services/base.service';
import { TYPES } from '../../lib/types';
import { VideoRepository } from './db/repository';
import { RunwayService } from './runway/service';
import { RunwayResponse, RunwayStatus, RUNWAY_STATUS_MAP } from './runway/types';
import { VideoGenerationService } from './generation';
import { VideoProcessingService } from './processing';
import { VideoValidationService } from './validation';
import { VideoStateMachine } from './state-machine';
import { VideoEventEmitter } from './events';
import { GenerationStatus, VideoMetadata, StateHooks } from './types';
import { VideoError, VideoProcessingError } from './errors';
import { ErrorCode } from '../../types/errors';
import { DbGeneration, DbGenerationUpdate } from './db/types';

interface PollingStats {
  activePolls: number;
  completedPolls: number;
  failedPolls: number;
  lastPollTime: Date;
  averageProcessingTime: number;
}

@injectable()
export class VideoPollingService extends BaseService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private stateMachines: Map<string, VideoStateMachine> = new Map();
  private stats: PollingStats = {
    activePolls: 0,
    completedPolls: 0,
    failedPolls: 0,
    lastPollTime: new Date(),
    averageProcessingTime: 0
  };
  private isPolling = false;
  private pollingInterval = 10000; // 10 seconds
  private maxRetries = 3;

  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.VideoRepository) private readonly repository: VideoRepository,
    @inject(TYPES.RunwayService) private readonly runwayService: RunwayService,
    @inject(TYPES.VideoGenerationService) private readonly generationService: VideoGenerationService,
    @inject(TYPES.VideoProcessingService) private readonly processingService: VideoProcessingService,
    @inject(TYPES.VideoValidationService) private readonly validationService: VideoValidationService,
    @inject(TYPES.VideoEventEmitter) private readonly eventEmitter: VideoEventEmitter
  ) {
    super(logger, 'VideoPollingService');
  }

  async startPolling(generationId: string, userId: string): Promise<void> {
    try {
      this.logInfo('Starting polling', { generationId, userId });

      // Get generation details
      const { data: generation, error } = await this.repository.getGeneration(generationId);
      if (error) throw error;
      if (!generation) {
        throw new VideoError(ErrorCode.VIDEO_NOT_FOUND, `Generation not found: ${generationId}`);
      }

      // Initialize state machine for this generation
      const stateMachine = new VideoStateMachine(
        generationId,
        generation.status,
        {
          beforeTransition: async (from: GenerationStatus, to: GenerationStatus) => {
            await this.handleBeforeTransition(generation, from, to);
          },
          afterTransition: async (from: GenerationStatus, to: GenerationStatus) => {
            await this.handleAfterTransition(generation, from, to);
          },
          onError: async (error: Error, from: GenerationStatus, to: GenerationStatus) => {
            await this.handleTransitionError(generation, error, from, to);
          }
        }
      );
      this.stateMachines.set(generationId, stateMachine);

      // Start polling interval
      const interval = setInterval(
        () => this.pollGeneration(generationId),
        10000 // Poll every 10 seconds
      );

      this.pollingIntervals.set(generationId, interval);
      this.stats.activePolls++;

      this.logInfo('Polling started', { 
        generationId,
        currentStatus: stateMachine.getCurrentState()
      });

    } catch (error) {
      this.logError('Failed to start polling', error);
      throw error;
    }
  }

  async stopPolling(generationId: string): Promise<void> {
    try {
      const interval = this.pollingIntervals.get(generationId);
      if (interval) {
        clearInterval(interval);
        this.pollingIntervals.delete(generationId);
        this.stats.activePolls--;
      }

      const stateMachine = this.stateMachines.get(generationId);
      if (stateMachine) {
        this.stateMachines.delete(generationId);
      }

      this.logInfo('Polling stopped', { generationId });

    } catch (error) {
      this.logError('Failed to stop polling', error);
      throw error;
    }
  }

  private async pollGeneration(generationId: string): Promise<void> {
    try {
      const { data: generation, error } = await this.repository.getGeneration(generationId);
      
      if (error) throw error;
      if (!generation) throw new VideoProcessingError(`Generation not found: ${generationId}`);

      // Check generation status from Runway
      const runwayJobId = generation.metadata?.runwayJobId;
      if (!runwayJobId || typeof runwayJobId !== 'string') {
        throw new VideoProcessingError('Missing or invalid runway job ID');
      }

      const response = await this.runwayService.checkStatus(runwayJobId);
      const runwayStatus = response.status;

      // Map Runway status to our status
      const newStatus = RUNWAY_STATUS_MAP[runwayStatus];
      
      // Prepare update data
      const updates: DbGenerationUpdate = {
        status: newStatus
      };

      // Handle completion
      if (runwayStatus === 'SUCCEEDED' && response.output?.[0]?.url) {
        updates.video_url = response.output[0].url;
      }

      // Handle failure
      if (runwayStatus === 'FAILED') {
        updates.error_message = response.error || 'Generation failed';
      }

      // Update generation
      await this.repository.updateGeneration(generationId, updates);

    } catch (error) {
      this.logError('Error polling generation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async handleBeforeTransition(
    generation: DbGeneration,
    from: GenerationStatus,
    to: GenerationStatus
  ): Promise<void> {
    try {
      this.logInfo('Handling before transition', {
        generationId: generation.id,
        from,
        to
      });

      // Update generation status
      await this.repository.updateGeneration(generation.id, {
        status: to
      });

    } catch (error) {
      this.logError('Failed to handle before transition', error);
      throw error;
    }
  }

  private async handleAfterTransition(
    generation: DbGeneration,
    from: GenerationStatus,
    to: GenerationStatus
  ): Promise<void> {
    try {
      this.logInfo('Handling after transition', {
        generationId: generation.id,
        from,
        to
      });

      // Emit status change event
      this.eventEmitter.emit('video:status:change', {
        generationId: generation.id,
        fromStatus: from,
        toStatus: to,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logError('Failed to handle after transition', error);
      throw error;
    }
  }

  private async handleTransitionError(
    generation: DbGeneration,
    error: Error,
    from: GenerationStatus,
    to: GenerationStatus
  ): Promise<void> {
    try {
      this.logError('Handling transition error', {
        generationId: generation.id,
        from,
        to,
        error: error.message
      });

      // Update generation with error
      await this.repository.updateGeneration(generation.id, {
        status: GenerationStatus.FAILED,
        error_message: error.message
      });

      // Emit error event
      this.eventEmitter.emit('video:status:error', {
        generationId: generation.id,
        status: from,
        error,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      this.logError('Failed to handle transition error', err);
      throw err;
    }
  }

  private async handleCompletedGeneration(
    generation: DbGeneration,
    videoUrl: string
  ): Promise<void> {
    try {
      const stateMachine = this.stateMachines.get(generation.id);
      if (!stateMachine) {
        throw new VideoError(
          ErrorCode.VIDEO_GENERATION_FAILED,
          `No state machine found for generation: ${generation.id}`
        );
      }

      // Transition to processing state
      await stateMachine.transitionTo(GenerationStatus.PROCESSING);

      // Process the video
      const metadata: VideoMetadata = {
        generationId: generation.id,
        projectId: generation.metadata.projectId as string,
        userId: generation.user_id,
        runwayJobId: generation.metadata.runwayJobId as string,
        contentType: 'video/mp4', // Default content type
        size: 0 // Will be updated during processing
      };

      const result = await this.processingService.processVideo(videoUrl, metadata);

      if (result.success && result.videoUrl) {
        // Update generation with processed video URL
        await this.generationService.handleGenerationComplete(
          generation.id,
          result.videoUrl,
          result.metadata ? result.metadata as unknown as Record<string, unknown> : undefined
        );

        // Transition to completed state
        await stateMachine.transitionTo(GenerationStatus.COMPLETED);
        this.stats.completedPolls++;

        // Stop polling
        await this.stopPolling(generation.id);
      }

    } catch (error) {
      this.logError('Failed to handle completed generation', error);
      await this.handleFailedGeneration(
        generation,
        error instanceof Error ? error.message : 'Failed to process completed generation'
      );
    }
  }

  private async handleFailedGeneration(
    generation: DbGeneration,
    errorMessage: string
  ): Promise<void> {
    try {
      const stateMachine = this.stateMachines.get(generation.id);
      if (stateMachine) {
        await stateMachine.transitionTo(GenerationStatus.FAILED);
      }

      await this.repository.updateGeneration(generation.id, {
        status: GenerationStatus.FAILED,
        error_message: errorMessage
      });

      this.stats.failedPolls++;
      await this.stopPolling(generation.id);

    } catch (error) {
      this.logError('Failed to handle failed generation', error);
      throw error;
    }
  }

  private getCurrentState(generationId: string): GenerationStatus | null {
    const stateMachine = this.stateMachines.get(generationId);
    return stateMachine ? stateMachine.getCurrentState() : null;
  }

  private isTerminalStatus(status: GenerationStatus): boolean {
    return status === GenerationStatus.COMPLETED || status === GenerationStatus.FAILED;
  }
} 