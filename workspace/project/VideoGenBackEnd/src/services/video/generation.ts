import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../lib/services/base.service';
import { TYPES } from '../../lib/types';
import { ServiceResult } from '../../types';
import { VideoRepository } from './db/repository';
import { VideoValidationService } from './validation';
import { 
  VideoError, 
  VideoGenerationError, 
  VideoNotFoundError
} from './errors';
import { 
  GenerationStatus,
  IVideoGenerationService,
  VideoGenerationResult,
  VideoGenerationStatus,
  VideoMetadata,
  ProcessingResult
} from './types';
import { DbGenerationCreate, DbGenerationUpdate, DbGeneration } from './db/types';
import { ErrorCode } from '../../types/errors';
import { ProjectService } from '../project/service';
import { UserRole } from '../../types/auth';
import { RunwayClient } from './runway/client';
import { VideoProcessingService } from './processing';
import { ITokenService } from '../token/types';

// Define token cost
const VIDEO_GENERATION_TOKEN_COST = 1; // Cost per video generation

@injectable()
export class VideoGenerationService extends BaseService implements IVideoGenerationService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.VideoRepository) private readonly repository: VideoRepository,
    @inject(TYPES.VideoValidationService) private readonly validationService: VideoValidationService,
    @inject(TYPES.ProjectService) private readonly projectService: ProjectService,
    @inject(TYPES.RunwayClient) private readonly runwayClient: RunwayClient,
    @inject(TYPES.VideoProcessingService) private readonly processingService: VideoProcessingService,
    @inject(TYPES.TokenService) private readonly tokenService: ITokenService
  ) {
    super(logger, 'VideoGenerationService');
  }

  async startGeneration(
    userId: string,
    prompt: string,
    projectId: string
  ): Promise<VideoGenerationResult> {
    try {
      this.logger.info('Starting video generation', {
        userId,
        projectId,
        timestamp: new Date().toISOString()
      });

      // Check if user has enough tokens
      const balanceResult = await this.tokenService.getUserBalance(userId);
      
      if (!balanceResult.success) {
        this.logger.error('Token validation failed: Unable to check balance', {
          userId,
          projectId,
          error: balanceResult.error,
          service: 'token-validation',
          action: 'check-balance',
          result: 'error',
          timestamp: new Date().toISOString()
        });
        
        throw new VideoGenerationError(
          'Failed to check token balance',
          { userId }
        );
      }
      
      const userBalance = balanceResult.data || 0;
      
      if (userBalance < VIDEO_GENERATION_TOKEN_COST) {
        this.logger.warn('Token validation failed: Insufficient tokens', {
          userId,
          projectId,
          currentBalance: userBalance,
          requiredTokens: VIDEO_GENERATION_TOKEN_COST,
          service: 'token-validation',
          action: 'validate-balance',
          result: 'insufficient',
          timestamp: new Date().toISOString()
        });
        
        throw new VideoError(
          ErrorCode.INSUFFICIENT_TOKENS,
          'Insufficient tokens for video generation',
          { 
            userId,
            currentBalance: userBalance,
            requiredTokens: VIDEO_GENERATION_TOKEN_COST
          }
        );
      }
      
      this.logger.info('Token validation succeeded', {
        userId,
        projectId,
        currentBalance: userBalance,
        requiredTokens: VIDEO_GENERATION_TOKEN_COST,
        service: 'token-validation',
        action: 'validate-balance',
        result: 'success',
        timestamp: new Date().toISOString()
      });

      // Fetch project to get image URL
      const projectResult = await this.projectService.getProject(projectId, userId, UserRole.USER);
      
      if (!projectResult.success || !projectResult.data) {
        throw new VideoGenerationError(
          'Failed to fetch project',
          { projectId, userId }
        );
      }
      
      const project = projectResult.data;
      
      // Validate image URL
      if (!project.imageUrl) {
        throw new VideoGenerationError(
          'Project has no image URL',
          { projectId }
        );
      }

      // Create generation record with project_id
      const generation: DbGenerationCreate = {
        user_id: userId,
        project_id: projectId,
        prompt,
        status: GenerationStatus.QUEUED,
        metadata: {
          createdAt: new Date().toISOString(),
          imageUrl: project.imageUrl
        }
      };

      const { data: createdGeneration, error } = await this.repository.createGeneration(generation);

      if (error || !createdGeneration) {
        throw new VideoGenerationError(
          'Failed to create generation record',
          { error: error?.message }
        );
      }

      // Start the Runway generation process asynchronously
      this.startAsyncGeneration(createdGeneration.id, project.imageUrl, prompt, userId).catch(error => {
        this.logger.error('Async Runway generation failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          generationId: createdGeneration.id,
          projectId,
          userId,
          timestamp: new Date().toISOString()
        });
      });

      return {
        success: true,
        generationId: createdGeneration.id
      };

    } catch (error) {
      this.logger.error('Generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        projectId,
        timestamp: new Date().toISOString()
      });

      throw error instanceof VideoError ? error : new VideoGenerationError(
        'Failed to start generation',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Start the Runway generation process
   * This runs asynchronously after the initial response to the frontend
   */
  private async startAsyncGeneration(
    generationId: string,
    imageUrl: string,
    prompt: string,
    userId: string
  ): Promise<void> {
    try {
      // Update status to GENERATING
      await this.updateGenerationStatus(
        generationId,
        GenerationStatus.QUEUED,
        GenerationStatus.GENERATING
      );

      // Start Runway generation
      const runwayJobId = await this.runwayClient.generateVideo(imageUrl, prompt);

      // Update metadata with Runway job ID
      await this.repository.updateGeneration(generationId, {
        metadata: {
          runwayJobId,
          startedAt: new Date().toISOString()
        }
      });

      // Start polling for status updates
      this.startStatusPolling(generationId, runwayJobId, userId);

      this.logger.info('Runway generation started', {
        generationId,
        runwayJobId,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to start Runway generation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        userId,
        timestamp: new Date().toISOString()
      });

      // Update status to FAILED
      await this.updateGenerationStatus(
        generationId,
        GenerationStatus.GENERATING,
        GenerationStatus.FAILED,
        {
          error_message: error instanceof Error ? error.message : 'Failed to start generation'
        }
      );

      throw error;
    }
  }

  /**
   * Start polling for status updates
   */
  private async startStatusPolling(
    generationId: string,
    runwayJobId: string,
    userId: string
  ): Promise<void> {
    const MAX_ATTEMPTS = 60; // 5 minutes with 5-second intervals
    const POLLING_INTERVAL = 5000; // 5 seconds

    let attempts = 0;
    
    const poll = async () => {
      try {
        if (attempts >= MAX_ATTEMPTS) {
          this.logger.error('Polling exceeded maximum attempts', {
            generationId,
            runwayJobId,
            attempts,
            timestamp: new Date().toISOString()
          });
          
          await this.updateGenerationStatus(
            generationId,
            GenerationStatus.GENERATING,
            GenerationStatus.FAILED,
            {
              error_message: 'Generation timed out after 5 minutes'
            }
          );
          return;
        }

        attempts++;
        
        // Check Runway status
        const { status: runwayStatus, outputUrl } = await this.runwayClient.checkStatus(runwayJobId);
        
        this.logger.info('Polling status update', {
          generationId,
          runwayJobId,
          runwayStatus,
          hasOutput: !!outputUrl,
          attempt: attempts,
          timestamp: new Date().toISOString()
        });

        // Update generation status based on Runway status
        if (runwayStatus === GenerationStatus.PROCESSING) {
          if (!outputUrl) {
            this.logger.error('Runway generation completed but no output URL provided', {
              generationId,
              runwayJobId,
              timestamp: new Date().toISOString()
            });
            
            await this.updateGenerationStatus(
              generationId,
              GenerationStatus.GENERATING,
              GenerationStatus.FAILED,
              {
                error_message: 'No video URL received from Runway'
              }
            );
            return;
          }
          
          try {
            // Update status to PROCESSING explicitly
            await this.updateGenerationStatus(
              generationId,
              GenerationStatus.GENERATING,
              GenerationStatus.PROCESSING
            );
            
            // Get generation details to access project_id
            const generation = await this.fetchGeneration(generationId);
            
            // Process the video
            const metadata: VideoMetadata = {
              generationId,
              projectId: String((generation as any).project_id || ''),
              userId,
              contentType: 'video/mp4',
              mimeType: 'video/mp4',
              type: 'video',
              size: 0 // Will be updated during processing
            };
            
            // Use VideoProcessingService to process the video
            const result = await this.processingService.processVideo(outputUrl, metadata);
            
            if (result.success && result.videoUrl) {
              // Update generation with permanent video URL
              await this.updateGenerationStatus(
                generationId,
                GenerationStatus.PROCESSING,
                GenerationStatus.COMPLETED,
                {
                  video_url: result.videoUrl,
                  completed_at: new Date().toISOString()
                }
              );
              
              // Deduct tokens for the completed generation
              const tokenResult = await this.tokenService.useTokens(
                userId, 
                VIDEO_GENERATION_TOKEN_COST,
                `Video generation: ${generationId}`
              );
              
              if (!tokenResult.success) {
                this.logger.error('Failed to deduct tokens for video generation', {
                  error: tokenResult.error,
                  userId,
                  generationId,
                  tokenCost: VIDEO_GENERATION_TOKEN_COST,
                  service: 'token-deduction',
                  action: 'deduct-tokens',
                  result: 'error',
                  timestamp: new Date().toISOString()
                });
                // We don't fail the generation if token deduction fails
                // since the video has already been generated
              } else {
                this.logger.info('Tokens deducted for video generation', {
                  userId,
                  generationId,
                  tokenCost: VIDEO_GENERATION_TOKEN_COST,
                  newBalance: tokenResult.data,
                  service: 'token-deduction',
                  action: 'deduct-tokens',
                  result: 'success',
                  timestamp: new Date().toISOString()
                });
              }
              
              this.logger.info('Generation completed and video processed successfully', {
                generationId,
                runwayJobId,
                videoUrl: result.videoUrl,
                timestamp: new Date().toISOString()
              });
            } else {
              throw new Error('Video processing failed');
            }
            
            return;
          } catch (error) {
            // Handle processing error
            await this.handleGenerationError(
              generationId,
              GenerationStatus.PROCESSING,
              error
            );
            return;
          }
        } else if (runwayStatus === GenerationStatus.FAILED) {
          // Handle failure
          await this.updateGenerationStatus(
            generationId,
            GenerationStatus.GENERATING,
            GenerationStatus.FAILED,
            {
              error_message: 'Runway generation failed'
            }
          );
          
          this.logger.error('Generation failed', {
            generationId,
            runwayJobId,
            timestamp: new Date().toISOString()
          });
          
          return;
        }

        // Continue polling if still in progress
        setTimeout(poll, POLLING_INTERVAL);
      } catch (error) {
        this.logger.error('Polling error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          generationId,
          runwayJobId,
          timestamp: new Date().toISOString()
        });
        
        // Continue polling despite errors, unless max attempts reached
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, POLLING_INTERVAL);
        } else {
          await this.updateGenerationStatus(
            generationId,
            GenerationStatus.GENERATING,
            GenerationStatus.FAILED,
            {
              error_message: 'Polling failed: ' + (error instanceof Error ? error.message : 'Unknown error')
            }
          );
        }
      }
    };

    // Start polling
    setTimeout(poll, POLLING_INTERVAL);
  }

  /**
   * Fetch generation details
   */
  private async fetchGeneration(generationId: string): Promise<DbGeneration> {
    const { data: generation, error } = await this.repository.getGeneration(generationId);
    
    if (error) {
      throw error;
    }
    
    if (!generation) {
      throw new VideoGenerationError(
        ErrorCode.VIDEO_NOT_FOUND,
        { message: `Generation not found: ${generationId}` }
      );
    }
    
    return generation;
  }

  /**
   * Handle generation errors
   */
  private async handleGenerationError(
    generationId: string,
    fromStatus: GenerationStatus,
    error: unknown
  ): Promise<void> {
    try {
      await this.updateGenerationStatus(
        generationId,
        fromStatus,
        GenerationStatus.FAILED,
        {
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      
      this.logger.error('Generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        fromStatus,
        timestamp: new Date().toISOString()
      });
    } catch (updateError) {
      this.logger.error('Failed to update generation status after error', {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        updateError: updateError instanceof Error ? updateError.message : 'Unknown error',
        generationId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update generation status
   */
  private async updateGenerationStatus(
    generationId: string,
    fromStatus: GenerationStatus | null,
    toStatus: GenerationStatus,
    updates: DbGenerationUpdate = {}
  ): Promise<void> {
    try {
      // Get current generation
      const { data: generation } = await this.repository.getGeneration(generationId);
      
      if (!generation) {
        throw new VideoNotFoundError(generationId);
      }
      
      // Validate status transition if fromStatus is provided
      if (fromStatus !== null && generation.status !== fromStatus) {
        this.logger.warn('Invalid status transition', {
          generationId,
          currentStatus: generation.status,
          expectedStatus: fromStatus,
          newStatus: toStatus,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Update generation status
      await this.repository.updateGeneration(generationId, {
        status: toStatus,
        ...updates
      });
      
      this.logger.info('Generation status updated', {
        generationId,
        fromStatus: generation.status,
        toStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to update generation status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        fromStatus,
        toStatus,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async getGenerationStatus(
    generationId: string,
    userId: string
  ): Promise<VideoGenerationStatus> {
    try {
      const { data: generation, error } = await this.repository.getGeneration(generationId);

      if (error) throw error;
      if (!generation) throw new VideoNotFoundError(generationId);

      if (generation.user_id !== userId) {
        throw new VideoError(
          ErrorCode.FORBIDDEN,
          'Access denied to video generation',
          { generationId, userId }
        );
      }

      return {
        status: generation.status,
        videoUrl: generation.video_url || undefined,
        error: generation.error_message || undefined,
        metadata: generation.metadata
      };

    } catch (error) {
      this.logger.error('Failed to get generation status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async handleGenerationComplete(
    generationId: string,
    videoUrl: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.updateGenerationStatus(
        generationId,
        null,
        GenerationStatus.COMPLETED,
        {
          video_url: videoUrl,
          completed_at: new Date().toISOString(),
          metadata
        }
      );
    } catch (error) {
      this.logger.error('Failed to handle generation completion', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async handleGenerationFailure(
    generationId: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.updateGenerationStatus(
        generationId,
        null,
        GenerationStatus.FAILED,
        {
          error_message: error.message,
          metadata
        }
      );
    } catch (updateError) {
      this.logger.error('Failed to handle generation failure', {
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
        originalError: error.message,
        generationId,
        timestamp: new Date().toISOString()
      });
      throw updateError;
    }
  }
}