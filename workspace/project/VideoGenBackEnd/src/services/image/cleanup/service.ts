import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../../lib/services/base.service';
import { TYPES } from '../../../lib/types';
import { ImageRepository } from '../repository';
import { ImageStorageService } from '../storage/service';
import { CleanupConfig, CleanupResult, CleanupStats, ICleanupService } from './types';
import { DEFAULT_CLEANUP_CONFIG } from './constants';
import { CleanupInProgressError, FileSystemError, StorageError, DatabaseError } from './errors';

@injectable()
export class CleanupService extends BaseService implements ICleanupService {
  private config: CleanupConfig = DEFAULT_CLEANUP_CONFIG;
  private isRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastRunStats: CleanupStats | null = null;
  private totalCleanups: number = 0;
  private successfulCleanups: number = 0;
  private failedCleanups: number = 0;

  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.ImageRepository) private readonly repository: ImageRepository,
    @inject(TYPES.ImageStorageService) private readonly storageService: ImageStorageService
  ) {
    super(logger, 'CleanupService');
  }

  async cleanup(): Promise<CleanupResult> {
    if (this.isRunning) {
      throw new CleanupInProgressError();
    }

    try {
      this.isRunning = true;
      const startTime = new Date();
      this.totalCleanups++;

      const stats: CleanupStats = {
        tempFilesRemoved: 0,
        staleUploadsRemoved: 0,
        failedUploadsRemoved: 0,
        totalBytesRecovered: 0,
        startTime,
        endTime: startTime,
        errors: []
      };

      // Run all cleanup operations
      const [tempResult, staleResult, failedResult] = await Promise.all([
        this.cleanupTempFiles(),
        this.cleanupStaleUploads(),
        this.cleanupFailedUploads()
      ]);

      // Aggregate results
      stats.tempFilesRemoved = tempResult.data?.tempFilesRemoved || 0;
      stats.staleUploadsRemoved = staleResult.data?.staleUploadsRemoved || 0;
      stats.failedUploadsRemoved = failedResult.data?.failedUploadsRemoved || 0;
      stats.totalBytesRecovered = (tempResult.data?.totalBytesRecovered || 0) +
        (staleResult.data?.totalBytesRecovered || 0) +
        (failedResult.data?.totalBytesRecovered || 0);
      stats.errors = [
        ...(tempResult.data?.errors || []),
        ...(staleResult.data?.errors || []),
        ...(failedResult.data?.errors || [])
      ];
      stats.endTime = new Date();

      // Update monitoring stats
      this.lastRunStats = stats;
      if (stats.errors.length === 0) {
        this.successfulCleanups++;
      } else {
        this.failedCleanups++;
      }

      // Log cleanup results
      this.logger.info('Cleanup operation completed', {
        duration: stats.endTime.getTime() - stats.startTime.getTime(),
        tempFilesRemoved: stats.tempFilesRemoved,
        staleUploadsRemoved: stats.staleUploadsRemoved,
        failedUploadsRemoved: stats.failedUploadsRemoved,
        totalBytesRecovered: stats.totalBytesRecovered,
        errorCount: stats.errors.length,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.failedCleanups++;
      this.logger.error('Cleanup operation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error during cleanup')
      };
    } finally {
      this.isRunning = false;
    }
  }

  async cleanupTempFiles(): Promise<CleanupResult> {
    if (this.isRunning) {
      throw new CleanupInProgressError();
    }

    const stats: CleanupStats = {
      tempFilesRemoved: 0,
      staleUploadsRemoved: 0,
      failedUploadsRemoved: 0,
      totalBytesRecovered: 0,
      startTime: new Date(),
      endTime: new Date(),
      errors: []
    };

    try {
      const now = Date.now();
      const tempFiles = await this.storageService.listFiles(this.config.tempDirectory);

      for (const file of tempFiles) {
        try {
          if (now - file.lastModified.getTime() > this.config.tempFileMaxAge) {
            // If we have userId, use the standard delete method
            if (file.userId) {
              const projectId = this.extractProjectId(file.path);
              if (projectId) {
                await this.storageService.deleteFile(file.userId, projectId);
              }
            }
            
            // If no userId or projectId, we can't use standard delete
            // Add direct path-based deletion here if needed
            
            const size = file.size || await this.storageService.getFileSize(file.path);
            stats.tempFilesRemoved++;
            stats.totalBytesRecovered += size;
          }
        } catch (error) {
          this.logger.error('Failed to cleanup temp file', {
            error: error instanceof Error ? error.message : 'Unknown error',
            filePath: file.path
          });
          stats.errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }
      }

      stats.endTime = new Date();
      return { success: true, data: stats };
    } catch (error) {
      this.logger.error('Failed to cleanup temp files', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to cleanup temp files')
      };
    }
  }

  private extractProjectId(path: string): string | null {
    // Extract project ID from path based on our path convention
    const matches = path.match(/projects\/([^\/]+)/);
    return matches ? matches[1] : null;
  }

  async cleanupStaleUploads(): Promise<CleanupResult> {
    try {
      const stats: CleanupStats = {
        tempFilesRemoved: 0,
        staleUploadsRemoved: 0,
        failedUploadsRemoved: 0,
        totalBytesRecovered: 0,
        startTime: new Date(),
        endTime: new Date(),
        errors: []
      };

      const staleUploads = await this.repository.getStaleUploads(this.config.staleUploadMaxAge);
      
      for (const upload of staleUploads.data || []) {
        try {
          if (upload.image_url && upload.user_id && upload.project_id) {
            const size = await this.storageService.getFileSize(upload.image_url);
            await this.storageService.deleteFile(upload.user_id, upload.image_url);
            await this.repository.deleteImage(upload.project_id, upload.user_id);
            stats.staleUploadsRemoved++;
            stats.totalBytesRecovered += size;
          }
        } catch (error) {
          stats.errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }
      }

      stats.endTime = new Date();
      return { success: true, data: stats };
    } catch (error) {
      if (error instanceof Error) {
        throw new StorageError(error.message);
      }
      throw new StorageError('Unknown error during stale upload cleanup');
    }
  }

  async cleanupFailedUploads(): Promise<CleanupResult> {
    try {
      const stats: CleanupStats = {
        tempFilesRemoved: 0,
        staleUploadsRemoved: 0,
        failedUploadsRemoved: 0,
        totalBytesRecovered: 0,
        startTime: new Date(),
        endTime: new Date(),
        errors: []
      };

      const failedUploads = await this.repository.getFailedUploads(this.config.failedUploadMaxAge);
      
      for (const upload of failedUploads.data || []) {
        try {
          if (upload.image_url && upload.user_id && upload.project_id) {
            const size = await this.storageService.getFileSize(upload.image_url);
            await this.storageService.deleteFile(upload.user_id, upload.image_url);
            await this.repository.deleteImage(upload.project_id, upload.user_id);
            stats.failedUploadsRemoved++;
            stats.totalBytesRecovered += size;
          }
        } catch (error) {
          stats.errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }
      }

      stats.endTime = new Date();
      return { success: true, data: stats };
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(error.message);
      }
      throw new DatabaseError('Unknown error during failed upload cleanup');
    }
  }

  /**
   * Get current cleanup statistics
   */
  getStats(): {
    totalCleanups: number;
    successfulCleanups: number;
    failedCleanups: number;
    lastRunStats: CleanupStats | null;
  } {
    return {
      totalCleanups: this.totalCleanups,
      successfulCleanups: this.successfulCleanups,
      failedCleanups: this.failedCleanups,
      lastRunStats: this.lastRunStats
    };
  }

  /**
   * Monitor storage usage
   */
  private async monitorStorageUsage(): Promise<void> {
    try {
      const tempFiles = await this.storageService.listFiles(this.config.tempDirectory);
      const totalSize = await Promise.all(
        tempFiles.map(file => file.path ? this.storageService.getFileSize(file.path) : 0)
      ).then(sizes => sizes.reduce((total, size) => total + size, 0));

      this.logger.info('Storage usage stats', {
        tempFileCount: tempFiles.length,
        totalSizeBytes: totalSize,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to monitor storage usage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  startScheduledCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(async () => {
      try {
        await this.monitorStorageUsage();
        const result = await this.cleanup();
        if (!result.success) {
          this.logger.error('Scheduled cleanup failed', {
            error: result.error,
            timestamp: new Date().toISOString()
          });
        } else {
          this.logger.info('Scheduled cleanup completed', {
            stats: result.data,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        this.logger.error('Error during scheduled cleanup', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }, this.config.cleanupInterval);
  }

  stopScheduledCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
} 