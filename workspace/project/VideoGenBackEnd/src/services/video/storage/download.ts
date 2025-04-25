import { logger } from '../../../lib/server/logger';
import { VideoGenerationError } from '../errors';
import { ErrorCode } from '../../../types/errors';

export async function downloadVideo(url: string): Promise<Buffer> {
  try {
    logger.info('Downloading video', { url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    logger.info('Video downloaded successfully', {
      url,
      size: buffer.length
    });

    return buffer;
  } catch (error) {
    logger.error('Failed to download video', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url
    });

    throw new VideoGenerationError(
      ErrorCode.VIDEO_GENERATION_FAILED,
      { message: 'Failed to download video from RunwayML', error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
} 