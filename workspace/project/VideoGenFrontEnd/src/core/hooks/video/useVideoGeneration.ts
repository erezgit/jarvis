import { useState, useCallback, useEffect, useRef } from 'react';
import { videoGenerationService } from '@/core/services/videos/generation/service';
import { ProjectService } from '@/core/services/projects';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { mapGenerationsToVideos } from '@/core/services/videos/mappers';
import type { Generation, GenerationStatus } from '@/core/services/projects';
import type { VideoStatus } from '@/core/services/videos/status/types';
import { PROJECT_KEYS, VIDEO_KEYS } from '@/core/services/queryKeys';
import { useVideoStatusPolling } from './useVideoStatusPolling';
import type { ServiceResult } from '@/core/types/service';
import type { VideoGenerationResponse } from '@/core/services/videos/generation/types';

export interface UseVideoGenerationOptions {
  projectId?: string;
  onVideosUpdate?: (videos: Video[]) => void;
  pollingInterval?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
  onInsufficientCredits?: () => void;
  imageUrl?: string;
  onGenerationComplete?: () => void;
}

interface UseVideoGenerationReturn {
  prompt: string;
  isGenerating: boolean;
  canGenerate: boolean;
  progress: number;
  error: string | undefined;
  status: GenerationStatus | 'idle';
  videoUrl: string | undefined;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => Promise<void>;
  reset: () => void;
}

// Import Video type or define it if not available
interface Video {
  id: string;
  url: string;
  status: VideoStatus | string; // Accept both VideoStatus and string to be more flexible
  prompt?: string;
  createdAt?: string;
  metadata?: {
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
    [key: string]: unknown;
  };
}

export function useVideoGeneration(options: UseVideoGenerationOptions): UseVideoGenerationReturn {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<GenerationStatus | 'idle'>('idle');
  const [videoUrl, setVideoUrl] = useState<string>();
  const hasProcessedTerminalStatusRef = useRef<boolean>(false);

  // Enhanced projectId tracking
  const initialProjectId = options.projectId;
  const [effectiveProjectId, setEffectiveProjectId] = useState<string | undefined>(
    initialProjectId,
  );
  const currentProjectIdRef = useRef<string | undefined>(initialProjectId);

  const currentGenerationIdRef = useRef<string | undefined>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Use our new videoStatusPolling hook
  const videoStatusPolling = useVideoStatusPolling({
    pollingInterval: options.pollingInterval,
    onVideoComplete: (video) => {
      console.log('[useVideoGeneration] Video complete callback with video object:', video);

      // Map the status to ensure it's compatible with our Video type
      // This handles the case where status/types.ts has 'pending' but videos/types.ts doesn't
      const mappedStatus = video.status === 'pending' ? 'queued' : video.status;

      // Convert to the correct Video type
      const standardizedVideo: Video = {
        id: video.id,
        url: video.url,
        status: mappedStatus,
        prompt: video.prompt || prompt,
        createdAt: video.createdAt || new Date().toISOString(),
      };

      // Add metadata if the Video type supports it
      try {
        standardizedVideo.metadata = {
          thumbnailUrl: undefined,
          duration: undefined,
        };
      } catch (e) {
        console.warn('[useVideoGeneration] Could not add metadata to video object');
      }

      // Call onVideosUpdate to update UI directly
      if (options.onVideosUpdate) {
        console.log(
          '[useVideoGeneration] Calling onVideosUpdate with standardized video:',
          standardizedVideo,
        );
        options.onVideosUpdate([standardizedVideo]);
      }
    },
    onComplete: (data) => {
      console.log('[useVideoGeneration] Video generation completed', data);

      // Update status and progress
      setStatus('completed');
      setProgress(100);
      options.onProgress?.(100);

      // Handle completion
      handleGenerationComplete(
        currentProjectIdRef.current,
        currentGenerationIdRef.current,
        data.videoUrl || undefined,
      );
      
      // Reset generating state here when video is actually complete
      setIsGenerating(false);
    },
    onError: (err) => {
      console.error('[useVideoGeneration] Video status polling error:', err);
      handleError(err.message);
      setIsGenerating(false);
    },
    onStatusUpdate: (data) => {
      console.log(`[useVideoGeneration] Status update: ${data.status}`);

      // Update status
      setStatus(data.status as GenerationStatus);

      // Update progress based on status
      let progressValue = 0;
      switch (data.status) {
        case 'queued':
          progressValue = 10;
          break;
        case 'preparing':
          progressValue = 25;
          break;
        case 'generating':
          progressValue = 50;
          break;
        case 'processing':
          progressValue = 75;
          break;
        case 'completed':
          progressValue = 100;
          break;
        default:
          progressValue = 0;
      }

      setProgress(progressValue);
      options.onProgress?.(progressValue);
    },
  });

  // Update projectId tracking when options.projectId changes
  useEffect(() => {
    console.log('[useVideoGeneration] projectId changed in options:', options.projectId);

    if (options.projectId) {
      // Update both state and ref when a valid projectId is provided
      setEffectiveProjectId(options.projectId);
      currentProjectIdRef.current = options.projectId;
      console.log('[useVideoGeneration] Updated effectiveProjectId:', options.projectId);
    }
  }, [options.projectId]);

  const handleError = useCallback(
    (message: string) => {
      setError(message);
      
      // Check if the error is related to insufficient credits
      const isInsufficientCreditsError = 
        message.toLowerCase().includes('insufficient credit') || 
        message.toLowerCase().includes('not enough credit') ||
        message.toLowerCase().includes('insufficient balance') ||
        message.toLowerCase().includes('token/insufficient-balance');
      
      if (isInsufficientCreditsError && options.onInsufficientCredits) {
        console.log('[useVideoGeneration] Detected insufficient credits error, calling handler');
        options.onInsufficientCredits();
      } else {
        // For other errors, call the general error handler
        options.onError?.(message);
      }
      
      showToast(message, 'error');
    },
    [options, showToast],
  );

  // Helper function to get the best available projectId
  const getBestProjectId = useCallback((): string | undefined => {
    // First try the ref (most up-to-date)
    if (currentProjectIdRef.current) {
      return currentProjectIdRef.current;
    }

    // Then try the state
    if (effectiveProjectId) {
      return effectiveProjectId;
    }

    // Finally try the options
    return options.projectId;
  }, [effectiveProjectId, options.projectId]);

  // Helper function to invalidate queries with improved projectId handling
  const invalidateQueries = useCallback(
    (projectId?: string) => {
      // Use provided projectId or get the best available one
      const effectiveId = projectId || getBestProjectId();

      if (!effectiveId) {
        console.warn('[useVideoGeneration] Cannot invalidate queries: No projectId available');

        // Fallback: invalidate all project-related queries
        console.log('[useVideoGeneration] Falling back to invalidating all project queries');
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.all,
        });

        queryClient.invalidateQueries({
          queryKey: VIDEO_KEYS.all,
        });

        return;
      }

      console.log(`[useVideoGeneration] Invalidating queries for project: ${effectiveId}`);

      // Invalidate project-videos query
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.videos(effectiveId),
      });

      // Invalidate project-details query
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(effectiveId),
      });

      // Also invalidate generation status queries if needed
      queryClient.invalidateQueries({
        queryKey: VIDEO_KEYS.all,
      });

      // If we have a specific generation ID, invalidate that query too
      const generationId = currentGenerationIdRef.current;
      if (generationId) {
        queryClient.invalidateQueries({
          queryKey: VIDEO_KEYS.generation.status(effectiveId, generationId),
        });
      }

      console.log('[useVideoGeneration] Query invalidation complete');
    },
    [queryClient, getBestProjectId],
  );

  // Handle completion of video generation with improved projectId handling
  const handleGenerationComplete = useCallback(
    (projectId?: string, generationId?: string, videoUrl?: string) => {
      // Use provided projectId or get the best available one
      const effectiveId = projectId || getBestProjectId();
      const effectiveGenerationId = generationId || currentGenerationIdRef.current;

      if (!effectiveId) {
        console.error('[useVideoGeneration] Cannot handle completion: No projectId available');
        return;
      }

      if (!effectiveGenerationId) {
        console.warn('[useVideoGeneration] Handling completion without generationId');
      } else {
        console.log(
          `[useVideoGeneration] Handling generation completion for project ${effectiveId}, generation ${effectiveGenerationId}`,
        );
      }

      // Store the completion state in refs to prevent race conditions
      hasProcessedTerminalStatusRef.current = true;

      // Set local state for UI updates
      if (videoUrl) {
        setVideoUrl(videoUrl);
        options.onSuccess?.(videoUrl);
      }

      // Invalidate queries to refresh data instead of direct state updates
      invalidateQueries(effectiveId);

      // Call completion callback
      if (options.onGenerationComplete) {
        console.log('[useVideoGeneration] Calling onGenerationComplete callback');
        options.onGenerationComplete();
      }

      // Clear the current generation ID
      currentGenerationIdRef.current = undefined;
    },
    [invalidateQueries, options, getBestProjectId],
  );

  // Generate a video
  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      handleError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(undefined);
    setStatus('idle');
    setProgress(0);
    setVideoUrl(undefined);

    try {
      console.log('[useVideoGeneration] Starting video generation');

      // Create project if needed
      let projectId = getBestProjectId();
      if (!projectId) {
        console.log('[useVideoGeneration] No project ID, creating new project');

        // Try up to 3 times to create a project
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES) {
          try {
            const projectService = ProjectService.getInstance();
            const projectResult = await projectService.createProject({
              name: `Video Project - ${new Date().toISOString()}`,
            });

            if (projectResult.error || !projectResult.data) {
              throw new Error(projectResult.error?.message || 'Failed to create project');
            }

            projectId = projectResult.data.id;
            console.log(`[useVideoGeneration] Created new project: ${projectId}`);

            // Update projectId tracking
            setEffectiveProjectId(projectId);
            currentProjectIdRef.current = projectId;

            break; // Success, exit retry loop
          } catch (err) {
            retryCount++;
            console.error(
              `[useVideoGeneration] Error creating project (attempt ${retryCount}/${MAX_RETRIES}):`,
              err,
            );

            if (retryCount >= MAX_RETRIES) {
              throw new Error('Failed to create project after multiple attempts');
            }

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (!projectId) {
        throw new Error('No project ID available');
      }

      // Generate video
      console.log(`[useVideoGeneration] Generating video for project ${projectId}`);

      // Try up to 3 times to generate a video
      let retryCount = 0;
      const MAX_RETRIES = 3;
      let generationResult: ServiceResult<VideoGenerationResponse> | null = null;

      while (retryCount < MAX_RETRIES) {
        try {
          generationResult = await videoGenerationService.generateVideo({
            projectId,
            prompt,
            metadata: {
              imageUrl: options.imageUrl || '',
            },
          });

          if (!generationResult || generationResult.error || !generationResult.data) {
            throw new Error(
              generationResult?.error instanceof Error
                ? generationResult.error.message
                : 'Failed to generate video',
            );
          }

          break; // Success, exit retry loop
        } catch (err) {
          retryCount++;
          console.error(
            `[useVideoGeneration] Error generating video (attempt ${retryCount}/${MAX_RETRIES}):`,
            err,
          );

          if (retryCount >= MAX_RETRIES) {
            throw new Error('Failed to generate video after multiple attempts');
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!generationResult || !generationResult.data) {
        throw new Error('Failed to generate video');
      }

      const generationId = generationResult.data.generationId;
      console.log(`[useVideoGeneration] Video generation started with ID: ${generationId}`);

      // Store the generation ID for polling
      currentGenerationIdRef.current = generationId;

      // Start polling for status
      videoStatusPolling.startPolling(generationId);
    } catch (err) {
      console.error('[useVideoGeneration] Error in handleGenerate:', err);
      handleError(err instanceof Error ? err.message : 'Failed to generate video');
      setIsGenerating(false);

      // Invalidate queries to ensure we have fresh data
      invalidateQueries();
    }
  }, [
    prompt,
    getBestProjectId,
    handleError,
    invalidateQueries,
    options.imageUrl,
    videoStatusPolling,
  ]);

  // Reset the generation state
  const reset = useCallback(() => {
    setPrompt('');
    setIsGenerating(false);
    setProgress(0);
    setError(undefined);
    setStatus('idle');
    setVideoUrl(undefined);
    videoStatusPolling.stopPolling();
    hasProcessedTerminalStatusRef.current = false;
    currentGenerationIdRef.current = undefined;
  }, [videoStatusPolling]);

  return {
    prompt,
    isGenerating,
    canGenerate: !!prompt && !isGenerating,
    progress,
    error,
    status,
    videoUrl,
    setPrompt,
    handleGenerate,
    reset,
  };
}
