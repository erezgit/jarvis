import { injectable, inject } from 'tsyringe';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { VideoRepository } from './db/repository';
import { StorageService } from './storage/service';
import { VideoProcessingError, MetadataExtractionError } from './errors';
import { VideoMetadata } from './types';
import { Readable } from 'stream';
import { join } from 'path';

// Configure FFmpeg paths
if (!ffmpegStatic) {
  throw new Error('FFmpeg binary not found. Please ensure ffmpeg-static is properly installed.');
}

const ffmpegPath = ffmpegStatic;
const ffprobePath = ffmpegPath.replace('ffmpeg', 'ffprobe');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

@injectable()
export class VideoMetadataService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  /**
   * Extract metadata from video buffer using FFmpeg
   */
  async extractMetadata(
    buffer: Buffer,
    initialMetadata: Pick<VideoMetadata, 'generationId' | 'projectId' | 'userId' | 'runwayJobId'>
  ): Promise<VideoMetadata> {
    try {
      this.logger.info('[VideoMetadata] Starting metadata extraction', {
        generationId: initialMetadata.generationId,
        timestamp: new Date().toISOString()
      });

      const metadata = await this.probeVideo(buffer);
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');

      if (!videoStream) {
        throw new MetadataExtractionError('No video stream found in file');
      }

      // Combine FFmpeg metadata with initial metadata
      const fullMetadata: VideoMetadata = {
        ...initialMetadata,
        contentType: this.getContentType(metadata),
        size: buffer.length,
        duration: metadata.format.duration,
        dimensions: {
          width: videoStream.width || 0,
          height: videoStream.height || 0
        },
        codec: videoStream.codec_name || undefined,
        frameRate: this.parseFrameRate(videoStream.r_frame_rate),
        bitrate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : undefined,
        format: metadata.format.format_name
      };

      this.logger.info('[VideoMetadata] Metadata extraction completed', {
        generationId: initialMetadata.generationId,
        metadata: {
          duration: fullMetadata.duration,
          dimensions: fullMetadata.dimensions,
          codec: fullMetadata.codec,
          frameRate: fullMetadata.frameRate,
          bitrate: fullMetadata.bitrate
        },
        timestamp: new Date().toISOString()
      });

      return fullMetadata;
    } catch (error) {
      this.logger.error('[VideoMetadata] Metadata extraction failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        generationId: initialMetadata.generationId,
        timestamp: new Date().toISOString()
      });
      throw new MetadataExtractionError(
        error instanceof Error ? error.message : 'Failed to extract video metadata'
      );
    }
  }

  /**
   * Validate video properties against requirements
   */
  async validateVideoProperties(metadata: VideoMetadata): Promise<{ isValid: boolean; error?: string }> {
    // Minimum requirements
    const MIN_DURATION = 1; // 1 second
    const MAX_DURATION = 300; // 5 minutes
    const MIN_WIDTH = 480;
    const MIN_HEIGHT = 360;
    const ALLOWED_CODECS = ['h264', 'vp8', 'vp9'];

    if (!metadata.duration || metadata.duration < MIN_DURATION) {
      return { isValid: false, error: `Video duration too short (minimum ${MIN_DURATION}s)` };
    }

    if (metadata.duration > MAX_DURATION) {
      return { isValid: false, error: `Video duration too long (maximum ${MAX_DURATION}s)` };
    }

    if (!metadata.dimensions || metadata.dimensions.width < MIN_WIDTH || metadata.dimensions.height < MIN_HEIGHT) {
      return { 
        isValid: false, 
        error: `Video resolution too low (minimum ${MIN_WIDTH}x${MIN_HEIGHT})` 
      };
    }

    if (!metadata.codec || !ALLOWED_CODECS.includes(metadata.codec)) {
      return { 
        isValid: false, 
        error: `Unsupported video codec ${metadata.codec}. Supported: ${ALLOWED_CODECS.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Probe video file using FFmpeg
   */
  private probeVideo(buffer: Buffer): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      // Create a readable stream from the buffer
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      ffmpeg()
        .input(stream)
        .ffprobe((err, metadata) => {
          if (err) {
            reject(new MetadataExtractionError(err.message));
            return;
          }
          resolve(metadata);
        });
    });
  }

  /**
   * Get content type from FFmpeg metadata
   */
  private getContentType(metadata: ffmpeg.FfprobeData): string {
    const format = metadata.format.format_name?.toLowerCase() || '';
    if (format.includes('mp4')) return 'video/mp4';
    if (format.includes('webm')) return 'video/webm';
    if (format.includes('quicktime')) return 'video/quicktime';
    return 'video/mp4'; // default
  }

  /**
   * Parse frame rate from FFmpeg ratio string (e.g., "30000/1001")
   */
  private parseFrameRate(rateStr?: string): number {
    if (!rateStr) return 0;
    const [num, den] = rateStr.split('/').map(Number);
    return den ? Math.round((num / den) * 100) / 100 : num;
  }
} 