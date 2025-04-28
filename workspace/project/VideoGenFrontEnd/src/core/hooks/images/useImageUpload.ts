import { useState, useCallback } from 'react';
import { imageService } from '@/core/services/images';
import type { ImageUploadResult, UploadStatusResponse } from '@/core/services/images';

export interface UseImageUploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: ImageUploadResult) => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  projectId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UseImageUploadReturn {
  uploadImage: (
    file: File,
    options?: {
      projectId?: string;
      metadata?: Record<string, string | number | boolean>;
    },
  ) => Promise<void>;
  isUploading: boolean;
  progress: number;
  error?: string;
  result?: ImageUploadResult;
  reset: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<ImageUploadResult>();

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(undefined);
    setResult(undefined);
  }, []);

  const uploadImage = useCallback(
    async (
      file: File,
      uploadOptions?: {
        projectId?: string;
        metadata?: Record<string, string | number | boolean>;
      },
    ) => {
      try {
        setIsUploading(true);
        setError(undefined);
        setProgress(0);

        // Start upload
        const uploadResult = await imageService.uploadImage(file, {
          retryAttempts: options.retryAttempts,
          projectId: uploadOptions?.projectId || options.projectId,
          metadata: uploadOptions?.metadata || options.metadata,
        });

        if (uploadResult.error) {
          throw uploadResult.error;
        }

        if (!uploadResult.data) {
          throw new Error('Upload failed: No response data');
        }

        // Set final result
        setResult(uploadResult.data);
        setProgress(100);
        options.onSuccess?.(uploadResult.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
}
