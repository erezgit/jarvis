import { useState, useCallback } from 'react';
import { imageService } from '@/core/services/images';
export function useImageUpload(options = {}) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState();
    const [result, setResult] = useState();
    const reset = useCallback(() => {
        setIsUploading(false);
        setProgress(0);
        setError(undefined);
        setResult(undefined);
    }, []);
    const uploadImage = useCallback(async (file, uploadOptions) => {
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
            setError(errorMessage);
            options.onError?.(errorMessage);
        }
        finally {
            setIsUploading(false);
        }
    }, [options]);
    return {
        uploadImage,
        isUploading,
        progress,
        error,
        result,
        reset,
    };
}
