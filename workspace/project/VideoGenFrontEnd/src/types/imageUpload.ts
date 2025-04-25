import type { IImageUploadProgress, IImageUploadError, IImageUploadResponse } from '@/types/api';

// Re-export types from api.ts
export type { IImageUploadProgress, IImageUploadError, IImageUploadResponse };

export interface IImageUploadStatus {
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
}

export interface IUseImageUploadOptions {
  onProgress?: (progress: IImageUploadProgress) => void;
  onError?: (error: IImageUploadError) => void;
  onSuccess?: (result: IImageUploadResponse) => void;
  retryAttempts?: number;
  pollingInterval?: number;
}

export interface IUseImageUploadReturn {
  image: File | null;
  preview: string | null;
  isLoading: boolean;
  error: Error | null;
  progress: number;
  status: IImageUploadStatus['status'];
  handleImageSelect: (file: File) => Promise<void>;
  handleDrop: (e: React.DragEvent) => void;
  reset: () => void;
}

export const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
};
