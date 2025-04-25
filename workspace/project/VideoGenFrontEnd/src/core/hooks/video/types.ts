import type { VideoStatus } from '@/core/services/videos';

/**
 * View model for video data in the video generation process
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

/**
 * Options for video generation hook
 */
export interface UseVideoGenerationOptions {
  projectId?: string;
  imageUrl?: string;
  onVideosUpdate?: (videos: VideoViewModel[]) => void;
  pollingInterval?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

/**
 * Return type for video generation hook
 */
export interface UseVideoGenerationReturn {
  prompt: string;
  isGenerating: boolean;
  canGenerate: boolean;
  progress: number;
  error: string | undefined;
  status: VideoStatus | 'idle';
  videoUrl: string | undefined;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => Promise<void>;
  reset: () => void;
}
