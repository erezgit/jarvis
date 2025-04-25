import { RunwayML } from '@runwayml/sdk';
import { logger } from '../../../lib/server/logger';
import { RunwayMLConfig, GenerationResponse, RunwayGenerationStatus, RUNWAY_STATUS_MAP, TaskRetrieveResponse } from './types';
import { RunwayGenerationError, RunwayStatusError } from './errors';
import { ErrorCode } from '../errors';
import { GenerationStatus } from '../types';

export class RunwayClient {
  private client: RunwayML;
  private config: RunwayMLConfig;
  private readonly MODEL_ID = 'gen3a_turbo';

  constructor(config: RunwayMLConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
    this.client = new RunwayML({ apiKey: this.config.apiKey });
  }

  async generateVideo(imageUrl: string, prompt: string): Promise<string> {
    try {
      logger.info('Starting video generation with Runway', { 
        imageUrl,
        promptLength: prompt.length
      });
      
      const response = await this.client.imageToVideo.create({
        model: this.MODEL_ID,
        promptImage: imageUrl,
        promptText: prompt
      });
      
      if (!response.id) {
        throw new RunwayGenerationError(
          ErrorCode.RUNWAY_GENERATION_FAILED,
          'Invalid generation response from Runway'
        );
      }
      
      logger.info('Runway generation started', { 
        runwayJobId: response.id
      });
      
      return response.id;
    } catch (error) {
      logger.error('Failed to start Runway generation', { error });
      throw new RunwayGenerationError(
        ErrorCode.RUNWAY_GENERATION_FAILED,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async checkStatus(generationId: string): Promise<{ status: GenerationStatus; outputUrl?: string }> {
    try {
      logger.info('Checking generation status', { generationId });
      
      const response = await this.client.tasks.retrieve(generationId) as TaskRetrieveResponse;
      
      if (!response.status) {
        throw new RunwayStatusError(
          ErrorCode.INVALID_GENERATION_STATUS,
          'Invalid generation status response'
        );
      }

      // Log the complete response for debugging
      logger.info('Runway status check response', { 
        generationId,
        rawStatus: response.status,
        hasOutput: !!response.output,
        outputLength: response.output?.length,
        outputDetails: response.output,
        error: response.error
      });

      const mappedStatus = RUNWAY_STATUS_MAP[response.status];
      
      // Extract output URL with fallbacks for different response structures
      let outputUrl: string | undefined;
      
      if (response.output && Array.isArray(response.output)) {
        if (response.output.length > 0) {
          // Try to get url from first output item
          if (typeof response.output[0] === 'object' && response.output[0] !== null) {
            outputUrl = response.output[0].url;
          } else if (typeof response.output[0] === 'string') {
            // Handle case where output might be an array of strings
            outputUrl = response.output[0];
          }
        }
      } else if (response.output && typeof response.output === 'object') {
        // Handle case where output might be a single object
        outputUrl = (response.output as any).url;
      } else if (typeof response.output === 'string') {
        // Handle case where output might be a string
        outputUrl = response.output;
      }

      logger.info('Retrieved generation status', { 
        status: mappedStatus,
        hasOutput: !!outputUrl,
        outputUrl: outputUrl
      });
      
      return { 
        status: mappedStatus, 
        outputUrl 
      };
    } catch (error) {
      logger.error('Failed to check generation status', { error, generationId });
      throw new RunwayStatusError(
        ErrorCode.RUNWAY_STATUS_CHECK_FAILED,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async checkGenerationStatus(generationId: string): Promise<RunwayGenerationStatus> {
    try {
      logger.info('Checking generation status', { generationId });
      
      const response = await this.client.tasks.retrieve(generationId) as TaskRetrieveResponse;
      
      if (!response.status) {
        throw new RunwayStatusError(
          ErrorCode.INVALID_GENERATION_STATUS,
          'Invalid generation status response'
        );
      }

      const mappedStatus = RUNWAY_STATUS_MAP[response.status];
      const progress = response.status === 'SUCCEEDED' ? 100 : 
                      response.status === 'FAILED' ? 0 : 50;

      const status: RunwayGenerationStatus = {
        status: mappedStatus,
        progress,
        error: response.error,
        output: response.output?.[0] ? { videoUrl: response.output[0].url } : undefined
      };

      logger.info('Retrieved generation status', { status });
      return status;
    } catch (error) {
      logger.error('Failed to check generation status', { error, generationId });
      throw new RunwayStatusError(
        ErrorCode.RUNWAY_STATUS_CHECK_FAILED,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
} 