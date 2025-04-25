/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { useState, useCallback, useEffect, useRef } from 'react';
import { ImageService } from '@/core/services/images';
import { useToast } from './useToast';
const DEFAULT_RETRY_ATTEMPTS = 3;
// Use window.URL to ensure TypeScript recognizes it
const _url = window.URL;
export function useImageUpload(options = {}) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('pending');
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const { showToast } = useToast();
    const pollingInterval = useRef(null);
    // Reset all states
    const reset = useCallback(() => {
        if (preview) {
            _url.revokeObjectURL(preview);
        }
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        setImage(null);
        setPreview(null);
        setStatus('pending');
        setIsLoading(false);
        setError(null);
        setProgress(0);
    }, [preview]);
    // Handle errors
    const handleError = useCallback((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus('failed');
        options.onError?.(err);
        showToast(error.message, 'error');
    }, [options, showToast]);
    // Handle file selection
    const handleImageSelect = useCallback(async (file) => {
        console.log('=== IMAGE UPLOAD STARTED ===', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            timestamp: new Date().toISOString(),
        });
        try {
            // Clean up previous state
            reset();
            // Create preview URL
            const previewUrl = _url.createObjectURL(file);
            setImage(file);
            setPreview(previewUrl);
            setIsLoading(true);
            setStatus('pending');
            // Start upload with progress tracking
            const response = await ImageService.getInstance().uploadImage(file, {
                retryAttempts: options.retryAttempts || DEFAULT_RETRY_ATTEMPTS,
                onProgress: (progress) => {
                    console.log('=== IMAGE UPLOAD PROGRESS ===', {
                        progress,
                        timestamp: new Date().toISOString(),
                    });
                    setProgress(progress.percentage);
                    options.onProgress?.(progress);
                },
            });
            console.log('=== IMAGE UPLOAD RESPONSE ===', {
                status: response.status,
                hasData: !!response.data,
                error: response.error,
                timestamp: new Date().toISOString(),
            });
            if (response.status === 'success' && response.data) {
                // Only revoke old URL after confirming new one exists
                if (response.data.imageUrl) {
                    _url.revokeObjectURL(previewUrl);
                    setPreview(response.data.imageUrl);
                    setStatus('completed');
                    setProgress(100);
                    options.onSuccess?.({
                        success: true,
                        projectId: response.data.projectId,
                        imageUrl: response.data.imageUrl,
                    });
                    showToast('Image upload completed successfully!', 'success');
                }
            }
            else {
                throw response.error || new Error('Upload failed');
            }
        }
        catch (err) {
            console.error('=== IMAGE UPLOAD ERROR ===', {
                error: err,
                fileName: file.name,
                timestamp: new Date().toISOString(),
            });
            handleError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [options, reset, showToast, handleError]);
    // Handle drag and drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleImageSelect(e.dataTransfer.files[0]);
            }
        }
        catch (err) {
            handleError(err);
        }
    }, [handleImageSelect, handleError]);
    // Cleanup on unmount
    useEffect(() => {
        const cleanup = () => {
            // Only revoke if it's a blob URL
            if (preview?.startsWith('blob:')) {
                _url.revokeObjectURL(preview);
            }
            // Store refs in variables to avoid closure issues
            const currentPollingInterval = pollingInterval.current;
            if (currentPollingInterval) {
                clearInterval(currentPollingInterval);
                pollingInterval.current = null;
            }
        };
        return cleanup;
    }, [preview]);
    return {
        image,
        preview,
        isLoading,
        error,
        progress,
        status,
        handleImageSelect,
        handleDrop,
        reset,
    };
}
