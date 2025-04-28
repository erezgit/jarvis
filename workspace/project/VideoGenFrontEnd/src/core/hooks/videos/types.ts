import type { VideoStatus } from '@/core/services/videos';

/**
 * View model for video data
 * Represents the transformed video data used in the UI
 */
export interface VideoViewModel {
  id: string;
  url: string | null;
  status: VideoStatus;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
}
