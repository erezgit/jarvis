import { BaseService } from '../../base/BaseService';
import { ServiceError as _ServiceError } from '../../base/errors';
import type { ServiceErrorCode as _ServiceErrorCode } from '../../base/types';
import type { ServiceResult } from '@/core/types/service';
import { VideoStatus, VideoStatusResponse } from './types';

/**
 * Service for checking video generation status
 * Implements the Video Status Endpoint (Service 2.2) as specified by the backend team
 */
export class VideoStatusService extends BaseService {
  private readonly BASE_PATH = '/api/videos';

  private static instance: VideoStatusService;

  protected constructor() {
    super();
  }

  public static getInstance(): VideoStatusService {
    if (!VideoStatusService.instance) {
      VideoStatusService.instance = new VideoStatusService();
    }
    return VideoStatusService.instance;
  }

  /**
   * Log a message with optional data
   * @param message The message to log
   * @param data Optional data to include in the log
   */
  protected log(message: string, data?: Record<string, unknown>): void {
    console.log(`[VideoStatusService] ${message}`, data || '');
  }

  /**
   * Check the status of a video generation
   * @param generationId The ID of the generation to check
   * @returns A ServiceResult containing the video status or an error
   */
  async checkStatus(generationId: string): Promise<ServiceResult<VideoStatusResponse>> {
    this.log('checkStatus', { generationId });

    return this.handleRequest<VideoStatusResponse>(() =>
      this.api.get<VideoStatusResponse>(`${this.BASE_PATH}/status/${generationId}`),
    );
  }

  /**
   * Determine if a status is terminal (completed or failed)
   * @param status The status to check
   * @returns True if the status is terminal, false otherwise
   */
  isTerminalStatus(status: VideoStatus): boolean {
    return status === 'completed' || status === 'failed';
  }
}
