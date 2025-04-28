// Built-in modules
import { useState, useCallback, useEffect, useRef } from 'react';
// Internal modules
import { VideoGenerationService } from '@/core/services/videos';
import { ProjectService } from '@/core/services/projects';
// Relative imports
import { useToast } from './useToast';
const DEFAULT_POLLING_INTERVAL = 2000; // 2 seconds
export function useVideoGeneration(hasImage, projectId, imageUrl, options = {}) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('idle');
    const [videoUrl, setVideoUrl] = useState(null);
    const { showToast } = useToast();
    const pollingInterval = useRef(null);
    const generationIdRef = useRef(null);
    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);
    // Reset all states
    const reset = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        setIsGenerating(false);
        setProgress(0);
        setError(null);
        setStatus('idle');
        setVideoUrl(null);
        generationIdRef.current = null;
    }, []);
    // Start polling for generation status
    const startStatusPolling = useCallback(async (generationId) => {
        // Start polling
        const interval = options.pollingInterval ?? DEFAULT_POLLING_INTERVAL;
        console.log('=== STARTING STATUS POLLING ===', {
            generationId,
            interval,
            timestamp: new Date().toISOString(),
        });
        if (pollingInterval.current) {
            console.log('=== CLEARING EXISTING POLLING INTERVAL ===', {
                timestamp: new Date().toISOString(),
            });
            clearInterval(pollingInterval.current);
        }
        const pollStatus = async () => {
            console.log('=== POLLING STATUS ===', {
                generationId,
                status,
                progress,
                timestamp: new Date().toISOString(),
            });
            try {
                const response = await VideoGenerationService.getInstance().checkStatus(generationId);
                console.log('=== POLL RESPONSE RECEIVED ===', {
                    apiStatus: response.status,
                    data: response.data,
                    error: response.error,
                    timestamp: new Date().toISOString(),
                });
                if (response.status === 'error' || !response.data) {
                    throw new Error(response.error?.message ?? 'Failed to check video status');
                }
                const statusData = response.data;
                console.log('=== VIDEO GENERATION STATUS ===', {
                    generationStatus: statusData.status,
                    progress: statusData.progress ?? 0,
                    videoUrl: statusData.videoUrl,
                    error: statusData.error,
                    timestamp: new Date().toISOString(),
                });
                setStatus(statusData.status);
                if (typeof statusData.progress === 'number') {
                    setProgress(statusData.progress);
                    options.onProgress?.(statusData.progress);
                }
                switch (statusData.status) {
                    case 'completed': {
                        console.log('=== VIDEO GENERATION COMPLETED ===', {
                            generationId,
                            timestamp: new Date().toISOString(),
                        });
                        clearInterval(pollingInterval.current);
                        setIsGenerating(false);
                        if (!projectId) {
                            console.log('=== SKIPPING PROJECT VIDEOS REFRESH: NO PROJECT ID ===', {
                                timestamp: new Date().toISOString(),
                            });
                            return;
                        }
                        try {
                            console.log('=== INITIATING PROJECT VIDEOS REFRESH ===', {
                                projectId,
                                generationId,
                                timestamp: new Date().toISOString(),
                            });
                            const videosResponse = await VideoGenerationService.getInstance().getProjectVideos(projectId);
                            if (videosResponse.status === 'success' && videosResponse.data) {
                                const generatedVideo = videosResponse.data.find((video) => video.id === generationId);
                                console.log('=== VIDEOS UPDATE SUCCESS ===', {
                                    projectId,
                                    videosCount: videosResponse.data.length,
                                    foundVideo: !!generatedVideo,
                                    videoStatus: generatedVideo?.status ?? 'unknown',
                                    timestamp: new Date().toISOString(),
                                });
                                if (generatedVideo?.videoUrl) {
                                    setVideoUrl(generatedVideo.videoUrl);
                                }
                                options.onVideosUpdate?.(videosResponse.data);
                                showToast('Video generation completed!', 'success');
                                options.onSuccess?.({
                                    generationId,
                                    projectId: projectId ?? '',
                                    status: 'completed',
                                    videoUrl: generatedVideo?.videoUrl ?? undefined,
                                });
                                return;
                            }
                            const errorMessage = videosResponse.error?.message ?? 'Failed to refresh video list';
                            console.error('=== PROJECT VIDEOS REFRESH ERROR ===', {
                                error: errorMessage,
                                projectId,
                                generationId,
                                timestamp: new Date().toISOString(),
                            });
                            showToast('Video generated but failed to refresh list', 'error');
                            return;
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh video list';
                            console.error('=== PROJECT VIDEOS REFRESH FAILED ===', {
                                error: errorMessage,
                                projectId,
                                generationId,
                                timestamp: new Date().toISOString(),
                            });
                            showToast('Video generated but failed to refresh list', 'error');
                            return;
                        }
                    }
                    case 'failed': {
                        const errorMessage = statusData.error ?? 'Video generation failed';
                        console.log('=== VIDEO GENERATION FAILED ===', {
                            generationId,
                            error: errorMessage,
                            timestamp: new Date().toISOString(),
                        });
                        clearInterval(pollingInterval.current);
                        setIsGenerating(false);
                        throw new Error(errorMessage);
                    }
                    case 'generating':
                    case 'queued':
                    case 'preparing':
                    case 'processing': {
                        console.log('=== GENERATION IN PROGRESS ===', {
                            status: statusData.status,
                            progress: statusData.progress ?? 0,
                            timestamp: new Date().toISOString(),
                        });
                        return;
                    }
                    default: {
                        console.warn('=== UNKNOWN GENERATION STATUS ===', {
                            status: statusData.status ?? 'unknown',
                            timestamp: new Date().toISOString(),
                        });
                        return;
                    }
                }
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to check video status';
                console.error('=== POLLING ERROR ===', {
                    generationId,
                    error: errorMessage,
                    timestamp: new Date().toISOString(),
                });
                setError(errorMessage);
                options.onError?.(errorMessage);
                showToast(errorMessage, 'error');
                clearInterval(pollingInterval.current);
                setIsGenerating(false);
                return;
            }
        };
        // Set up polling interval
        console.log('=== SETTING UP POLLING INTERVAL ===', {
            generationId,
            interval,
            timestamp: new Date().toISOString(),
        });
        pollingInterval.current = setInterval(pollStatus, interval);
        // Initial poll
        console.log('=== RUNNING INITIAL POLL ===', {
            generationId,
            timestamp: new Date().toISOString(),
        });
        await pollStatus();
    }, [options, projectId, showToast, status, progress]);
    // Check if we can generate (both image and prompt are provided)
    const canGenerate = hasImage && prompt.trim().length > 0 && !isGenerating;
    // Handle video generation
    const handleGenerate = useCallback(async () => {
        console.log('=== HANDLE GENERATE CALLED ===', {
            canGenerate,
            hasImage,
            imageUrl,
            projectId,
            prompt,
            timestamp: new Date().toISOString(),
        });
        if (!canGenerate) {
            console.log('Cannot generate: canGenerate is false');
            return false;
        }
        if (!imageUrl) {
            console.log('Cannot generate: no imageUrl');
            return false;
        }
        try {
            setIsGenerating(true);
            setError(null);
            setProgress(0);
            setStatus('queued');
            // If no projectId, create a new project
            let targetProjectId = projectId;
            if (!targetProjectId) {
                console.log('Creating new project for video generation');
                const projectResponse = await ProjectService.getInstance().createProject({
                    name: prompt,
                    description: `Video generation project for prompt: ${prompt}`,
                });
                if (projectResponse.status === 'error' || !projectResponse.data) {
                    throw new Error(projectResponse.error?.message || 'Failed to create project');
                }
                targetProjectId = projectResponse.data.id;
                console.log('New project created:', targetProjectId);
            }
            console.log('Calling video generation service with:', {
                prompt,
                projectId: targetProjectId,
                imageUrl,
            });
            const response = await VideoGenerationService.getInstance().generateVideo({
                prompt,
                projectId: targetProjectId,
                imageUrl,
            });
            console.log('Video generation response:', response);
            if (response.status === 'error' || !response.data) {
                throw new Error(response.error?.message || 'Failed to start video generation');
            }
            const { generationId } = response.data;
            generationIdRef.current = generationId;
            await startStatusPolling(generationId);
            return true;
        }
        catch (err) {
            setIsGenerating(false);
            setStatus('failed');
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
            setError(errorMessage);
            options.onError?.(errorMessage);
            showToast(errorMessage, 'error');
            return false;
        }
    }, [canGenerate, imageUrl, projectId, prompt, startStatusPolling, options, showToast, hasImage]);
    return {
        prompt,
        isGenerating,
        canGenerate,
        progress,
        error,
        status,
        videoUrl,
        setPrompt,
        handleGenerate,
        reset,
    };
}
