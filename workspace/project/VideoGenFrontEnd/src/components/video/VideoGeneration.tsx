import { useState, useCallback, useEffect } from 'react';
import { useVideoGeneration } from '@/core/hooks/video/useVideoGeneration';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { VideoPrompt } from './VideoPrompt';
import { VideoList } from './VideoList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/common/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import type {
  VideoGenerationProgress,
  VideoGenerationStatus,
} from '@/core/services/videos/generation/types';
import type { Video } from '@/core/services/videos/types';

interface VideoGenerationProps {
  projectId?: string;
  imageUrl?: string;
  onVideosUpdate?: (videos: Video[]) => void;
  className?: string;
}

export function VideoGeneration({
  projectId,
  imageUrl,
  onVideosUpdate,
  className,
}: VideoGenerationProps) {
  console.log(
    '[VideoGeneration] Component rendering with props:',
    JSON.stringify({
      hasProjectId: !!projectId,
      hasImageUrl: !!imageUrl,
      hasOnVideosUpdate: !!onVideosUpdate,
    }),
  );

  const [videos, setVideos] = useState<Video[]>([]);
  const { state: promptState } = usePromptSelection();
  const queryClient = useQueryClient();

  // Convert selected options to prompt string
  const generatePromptFromOptions = useCallback(() => {
    const selectedOptions = Object.values(promptState.selectedOptions);
    if (selectedOptions.length === 0) return '';

    return selectedOptions.map((option) => option.text).join(', ');
  }, [promptState.selectedOptions]);

  // Handle video updates
  const handleVideoUpdate = useCallback(
    (videos: Video[]) => {
      console.log(
        '[VideoGeneration] handleVideoUpdate called with:',
        JSON.stringify({
          videosCount: videos.length,
          firstVideoId: videos[0]?.id,
          hasOnVideosUpdate: !!onVideosUpdate,
        }),
      );

      // Log the first video for debugging
      if (videos.length > 0) {
        console.log(
          '[VideoGeneration] First video in update:',
          JSON.stringify({
            id: videos[0].id,
            url: videos[0].url,
            status: videos[0].status,
            hasMetadata: !!videos[0].metadata,
          }),
        );
      }

      console.log('[VideoGeneration] Setting local videos state');
      setVideos(videos as Video[]);

      if (onVideosUpdate) {
        console.log('[VideoGeneration] Calling parent onVideosUpdate');
        onVideosUpdate(videos as Video[]);
      } else {
        console.warn('[VideoGeneration] No parent onVideosUpdate callback provided');
      }
    },
    [onVideosUpdate],
  );

  // Handle progress updates
  const handleProgress = useCallback((progress: number) => {
    // Progress is handled internally by the hook
    console.log('[VideoGeneration] Progress update:', progress);
  }, []);

  // Handle generation completion
  const handleGenerationComplete = useCallback(() => {
    console.log('[VideoGeneration] Generation completed callback executed');
    console.log(
      '[VideoGeneration] Current videos state:',
      JSON.stringify({
        videosCount: videos.length,
        videoIds: videos.map((v) => v.id),
      }),
    );

    // Force refresh if we have a projectId
    if (projectId) {
      console.log('[VideoGeneration] Invalidating queries for project:', projectId);

      // Invalidate project videos query
      console.log('[VideoGeneration] Invalidating project-videos query');
      queryClient.invalidateQueries({
        queryKey: ['project-videos', projectId],
      });

      // Also invalidate project details query
      console.log('[VideoGeneration] Invalidating project-details query');
      queryClient.invalidateQueries({
        queryKey: ['project-details', projectId],
      });

      console.log('[VideoGeneration] Query invalidation complete');
    } else {
      console.warn('[VideoGeneration] No projectId available for query invalidation');
    }

    // The videos will also be updated through onVideosUpdate
  }, [videos, projectId, queryClient]);

  // Configure video generation options
  const options = {
    projectId,
    imageUrl,
    onVideosUpdate: handleVideoUpdate,
    onProgress: handleProgress,
    pollingInterval: 2000, // Poll every 2 seconds
    onGenerationComplete: handleGenerationComplete,
  };

  console.log(
    '[VideoGeneration] Configuring options:',
    JSON.stringify({
      hasProjectId: !!projectId,
      hasImageUrl: !!imageUrl,
      videosCount: videos.length,
      hasOnVideosUpdate: !!options.onVideosUpdate,
      hasOnGenerationComplete: !!options.onGenerationComplete,
    }),
  );

  // Use our standardized hook
  const { prompt, setPrompt, isGenerating, canGenerate, progress, error, status, handleGenerate } =
    useVideoGeneration({
      ...options,
      onInsufficientCredits: () => {
        console.log('[VideoGeneration] Redirecting to Credits page due to insufficient credits');
        // We need to import useNavigate and get navigate from it
        // Since this is a component, we'll add a simple callback to the options
        if (typeof window !== 'undefined') {
          window.location.href = '/credits';
        }
      },
    });

  // Update prompt when selected options change
  useEffect(() => {
    const newPrompt = generatePromptFromOptions();
    if (newPrompt) {
      console.log('[VideoGeneration] Setting prompt from options:', newPrompt);
      setPrompt(newPrompt);
    }
  }, [promptState.selectedOptions, generatePromptFromOptions, setPrompt]);

  // Show loading state while generating
  const isLoading = isGenerating;
  if (isLoading) {
    console.log('[VideoGeneration] Rendering loading state, progress:', progress);
    return (
      <div className="space-y-4">
        <VideoPrompt
          prompt={prompt}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          onPromptChange={setPrompt}
          onSubmit={handleGenerate}
          className={className}
        />
        <div className="mt-8">
          <Skeleton variant="video" className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Generating video... {Math.round(progress)}%
          </p>
        </div>
      </div>
    );
  }

  // Show error state for failed status
  if (error || status === 'failed') {
    console.log('[VideoGeneration] Rendering error state:', error || 'Video generation failed');
    return (
      <div className="space-y-4">
        <VideoPrompt
          prompt={prompt}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          onPromptChange={setPrompt}
          onSubmit={handleGenerate}
          className={className}
        />
        <Alert variant="destructive">
          <AlertDescription>{error || 'Video generation failed'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('[VideoGeneration] Rendering normal state with videos:', videos.length);
  return (
    <div className="space-y-4">
      <VideoPrompt
        prompt={prompt}
        isGenerating={isGenerating}
        canGenerate={canGenerate}
        onPromptChange={setPrompt}
        onSubmit={handleGenerate}
        className={className}
      />
      <VideoList
        videos={videos}
        isLoading={isGenerating}
        error={error ? new Error(error) : null}
        className="mt-8"
      />
    </div>
  );
}
