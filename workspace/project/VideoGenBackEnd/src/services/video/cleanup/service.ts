import { injectable } from 'tsyringe';
import { logger } from '../../../lib/server/logger';
import { createServerSupabase } from '../../../lib/supabase';
import { StorageService } from '../storage/service';
import { VideoGenerationService } from '../generation';
import { ErrorCode } from '../../../types/errors';
import { VideoGenerationError } from '../errors';
import { GenerationStatus } from '../types';

export const CLEANUP_CONFIG = {
  FAILED_GENERATION_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  TEMP_FILE_TTL: 24 * 60 * 60 * 1000,            // 24 hours in milliseconds
  BATCH_SIZE: 100,                                // Number of records to process in one batch
};

@injectable()
export class GenerationCleanupService {
  constructor(
    private storageService: StorageService,
    private videoService: VideoGenerationService
  ) {}

  /**
   * Clean up failed generations and their associated files
   */
  async cleanupFailedGenerations(): Promise<void> {
    try {
      logger.info('[Cleanup] Starting failed generations cleanup');
      
      const supabase = createServerSupabase();
      const cutoffDate = new Date(Date.now() - CLEANUP_CONFIG.FAILED_GENERATION_TTL);

      // Get failed generations older than cutoff date
      const { data: generations, error } = await supabase
        .from('generations')
        .select('id, video_url, metadata, user_id')
        .eq('status', 'failed')
        .lt('updated_at', cutoffDate.toISOString())
        .limit(CLEANUP_CONFIG.BATCH_SIZE);

      if (error) {
        throw error;
      }

      if (!generations?.length) {
        logger.info('[Cleanup] No failed generations to clean up');
        return;
      }

      logger.info('[Cleanup] Processing failed generations', { 
        count: generations.length 
      });

      // Process each failed generation
      for (const generation of generations) {
        try {
          await this.cleanupGeneration(generation.id, generation.user_id, generation.video_url);
        } catch (error) {
          logger.error('[Cleanup] Failed to clean up generation', {
            error: error instanceof Error ? error.message : 'Unknown error',
            generationId: generation.id
          });
          // Continue with next generation even if one fails
          continue;
        }
      }

      logger.info('[Cleanup] Completed failed generations cleanup', {
        processedCount: generations.length
      });

    } catch (error) {
      logger.error('[Cleanup] Failed to run cleanup process', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new VideoGenerationError(
        ErrorCode.VIDEO_GENERATION_FAILED,
        { message: 'Failed to clean up generations' }
      );
    }
  }

  /**
   * Clean up a specific generation and its files
   */
  private async cleanupGeneration(
    generationId: string,
    userId: string,
    videoUrl?: string | null
  ): Promise<void> {
    logger.info('[Cleanup] Cleaning up generation', { generationId });

    const supabase = createServerSupabase();

    try {
      // Delete from storage if video exists
      if (videoUrl) {
        await this.deleteGenerationFiles(generationId, userId);
      }

      // Mark generation as cleaned up in database
      const { error } = await supabase
        .from('generations')
        .update({
          status: 'cleaned' as GenerationStatus,
          video_url: null,
          metadata: {
            cleaned_at: new Date().toISOString(),
            original_video_url: videoUrl
          }
        })
        .eq('id', generationId);

      if (error) {
        throw error;
      }

      logger.info('[Cleanup] Generation cleaned up successfully', { generationId });

    } catch (error) {
      logger.error('[Cleanup] Failed to clean up generation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId
      });
      throw error;
    }
  }

  /**
   * Delete all files associated with a generation
   */
  private async deleteGenerationFiles(generationId: string, userId: string): Promise<void> {
    try {
      const supabase = createServerSupabase();
      
      // Delete all files in the generation's directory
      const { data, error } = await supabase.storage
        .from('project-files')
        .list(`${userId}/${generationId}`);

      if (error) {
        throw error;
      }

      if (!data?.length) {
        return;
      }

      const filesToDelete = data.map((file: { name: string }) => `${userId}/${generationId}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from('project-files')
        .remove(filesToDelete);

      if (deleteError) {
        throw deleteError;
      }

      logger.info('[Cleanup] Deleted generation files', { 
        generationId,
        fileCount: filesToDelete.length
      });

    } catch (error) {
      logger.error('[Cleanup] Failed to delete generation files', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId
      });
      throw error;
    }
  }

  /**
   * Schedule regular cleanup of failed generations
   */
  scheduleCleanup(intervalMs: number = 6 * 60 * 60 * 1000): void { // Default: 6 hours
    setInterval(async () => {
      try {
        await this.cleanupFailedGenerations();
      } catch (error) {
        logger.error('[Cleanup] Scheduled cleanup failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, intervalMs);

    logger.info('[Cleanup] Scheduled cleanup process', { 
      intervalMs,
      intervalHours: intervalMs / (60 * 60 * 1000)
    });
  }
} 