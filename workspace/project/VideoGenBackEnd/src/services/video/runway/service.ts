import { injectable } from 'tsyringe';
import RunwayML from '@runwayml/sdk';
import { RunwayConfig, RunwayResponse } from './types';
import { VideoGenerationError } from '../errors';
import { ErrorCode } from '../errors';
import { logger } from '../../../lib/server/logger';

@injectable()
export class RunwayService {
  private client: RunwayML;
  private readonly MODEL_ID = 'gen3a_turbo';

  constructor(private config: RunwayConfig) {
    if (!config.apiKey) {
      throw new VideoGenerationError(
        ErrorCode.VALIDATION_FAILED,
        { message: 'Failed to initialize Runway client - Missing API key' }
      );
    }

    this.client = new RunwayML({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries || 2,
      timeout: config.timeout || 30000
    });

    logger.info('Runway service initialized', {
      maxRetries: config.maxRetries,
      timeout: config.timeout
    });
  }

  /**
   * Generate a video using Runway ML
   * @param imageUrl URL of the source image
   * @param prompt Text prompt for generation
   * @returns Promise<string> Generation ID
   * @throws VideoGenerationError if generation fails
   */
  async generateVideo(imageUrl: string, prompt: string): Promise<string> {
    try {
      logger.info('[Runway] Starting video generation', {
        imageUrl,
        promptLength: prompt.length,
        timestamp: new Date().toISOString()
      });

      // Validate inputs
      if (!imageUrl || !prompt) {
        throw new VideoGenerationError(
          ErrorCode.VALIDATION_FAILED,
          { message: 'Image URL and prompt are required' }
        );
      }

      // Call Runway API
      const response = await this.client.imageToVideo.create({
        model: this.MODEL_ID,
        promptImage: imageUrl,
        promptText: prompt
      });

      if (!response?.id) {
        throw new VideoGenerationError(
          ErrorCode.RUNWAY_GENERATION_FAILED,
          { message: 'Failed to get generation ID from Runway' }
        );
      }

      logger.info('[Runway] Generation started successfully', {
        generationId: response.id,
        timestamp: new Date().toISOString()
      });

      return response.id;

    } catch (error) {
      logger.error('[Runway] Generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        imageUrl,
        promptLength: prompt.length,
        timestamp: new Date().toISOString()
      });

      if (error instanceof VideoGenerationError) {
        throw error;
      }

      throw new VideoGenerationError(
        ErrorCode.RUNWAY_GENERATION_FAILED,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Check the status of a generation
   */
  async checkStatus(generationId: string): Promise<RunwayResponse> {
    try {
      logger.info('[Runway] Checking generation status', {
        generationId,
        timestamp: new Date().toISOString()
      });

      const response = await this.client.get<RunwayResponse, any>(`/v1/tasks/${generationId}`);
      const data = response as RunwayResponse;
      
      if (!data?.status) {
        throw new VideoGenerationError(
          ErrorCode.RUNWAY_STATUS_CHECK_FAILED,
          { message: 'Invalid status response from Runway' }
        );
      }

      logger.info('[Runway] Status check completed', {
        generationId,
        status: data.status,
        hasOutput: !!data.output?.length,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      logger.error('[Runway] Status check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        timestamp: new Date().toISOString()
      });

      throw new VideoGenerationError(
        ErrorCode.RUNWAY_STATUS_CHECK_FAILED,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get the output URL for a completed generation
   */
  async getOutputUrl(generationId: string): Promise<string | null> {
    try {
      logger.info('[Runway] Getting output URL', {
        generationId,
        timestamp: new Date().toISOString()
      });

      const response = await this.checkStatus(generationId);
      const outputUrl = response.output?.[0]?.url;

      logger.info('[Runway] Output URL retrieval completed', {
        generationId,
        hasUrl: !!outputUrl,
        timestamp: new Date().toISOString()
      });

      return outputUrl || null;
    } catch (error) {
      logger.error('[Runway] Failed to get output URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
} 