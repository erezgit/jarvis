import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { useVideoGeneration } from '@/core/hooks/video/useVideoGeneration';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { VideoPrompt } from './VideoPrompt';
import { VideoList } from './VideoList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/common/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
export function VideoGeneration({ projectId, imageUrl, onVideosUpdate, className, }) {
    console.log('[VideoGeneration] Component rendering with props:', JSON.stringify({
        hasProjectId: !!projectId,
        hasImageUrl: !!imageUrl,
        hasOnVideosUpdate: !!onVideosUpdate,
    }));
    const [videos, setVideos] = useState([]);
    const { state: promptState } = usePromptSelection();
    const queryClient = useQueryClient();
    // Convert selected options to prompt string
    const generatePromptFromOptions = useCallback(() => {
        const selectedOptions = Object.values(promptState.selectedOptions);
        if (selectedOptions.length === 0)
            return '';
        return selectedOptions.map((option) => option.text).join(', ');
    }, [promptState.selectedOptions]);
    // Handle video updates
    const handleVideoUpdate = useCallback((videos) => {
        console.log('[VideoGeneration] handleVideoUpdate called with:', JSON.stringify({
            videosCount: videos.length,
            firstVideoId: videos[0]?.id,
            hasOnVideosUpdate: !!onVideosUpdate,
        }));
        // Log the first video for debugging
        if (videos.length > 0) {
            console.log('[VideoGeneration] First video in update:', JSON.stringify({
                id: videos[0].id,
                url: videos[0].url,
                status: videos[0].status,
                hasMetadata: !!videos[0].metadata,
            }));
        }
        console.log('[VideoGeneration] Setting local videos state');
        setVideos(videos);
        if (onVideosUpdate) {
            console.log('[VideoGeneration] Calling parent onVideosUpdate');
            onVideosUpdate(videos);
        }
        else {
            console.warn('[VideoGeneration] No parent onVideosUpdate callback provided');
        }
    }, [onVideosUpdate]);
    // Handle progress updates
    const handleProgress = useCallback((progress) => {
        // Progress is handled internally by the hook
        console.log('[VideoGeneration] Progress update:', progress);
    }, []);
    // Handle generation completion
    const handleGenerationComplete = useCallback(() => {
        console.log('[VideoGeneration] Generation completed callback executed');
        console.log('[VideoGeneration] Current videos state:', JSON.stringify({
            videosCount: videos.length,
            videoIds: videos.map((v) => v.id),
        }));
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
        }
        else {
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
    console.log('[VideoGeneration] Configuring options:', JSON.stringify({
        hasProjectId: !!projectId,
        hasImageUrl: !!imageUrl,
        videosCount: videos.length,
        hasOnVideosUpdate: !!options.onVideosUpdate,
        hasOnGenerationComplete: !!options.onGenerationComplete,
    }));
    // Use our standardized hook
    const { prompt, setPrompt, isGenerating, canGenerate, progress, error, status, handleGenerate } = useVideoGeneration(options);
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
        return (_jsxs("div", { className: "space-y-4", children: [_jsx(VideoPrompt, { prompt: prompt, isGenerating: isGenerating, canGenerate: canGenerate, onPromptChange: setPrompt, onSubmit: handleGenerate, className: className }), _jsxs("div", { className: "mt-8", children: [_jsx(Skeleton, { variant: "video", className: "w-full" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["Generating video... ", Math.round(progress), "%"] })] })] }));
    }
    // Show error state for failed status
    if (error || status === 'failed') {
        console.log('[VideoGeneration] Rendering error state:', error || 'Video generation failed');
        return (_jsxs("div", { className: "space-y-4", children: [_jsx(VideoPrompt, { prompt: prompt, isGenerating: isGenerating, canGenerate: canGenerate, onPromptChange: setPrompt, onSubmit: handleGenerate, className: className }), _jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error || 'Video generation failed' }) })] }));
    }
    console.log('[VideoGeneration] Rendering normal state with videos:', videos.length);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(VideoPrompt, { prompt: prompt, isGenerating: isGenerating, canGenerate: canGenerate, onPromptChange: setPrompt, onSubmit: handleGenerate, className: className }), _jsx(VideoList, { videos: videos, isLoading: isGenerating, error: error ? new Error(error) : null, className: "mt-8" })] }));
}
