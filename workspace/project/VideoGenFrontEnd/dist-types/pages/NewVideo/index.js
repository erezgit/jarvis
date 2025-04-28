import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { ImageUpload } from '@/components/video/ImageUpload';
import { VideoList } from '@/components/video/VideoList';
import { useVideoGeneration } from '@/core/hooks/video';
import { useProjectDetails } from '@/core/hooks/projects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/button';
import { useShell } from '@/shell/MainShell';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { usePromptCategories } from '@/core/hooks/prompts';
import { PromptSelectionPanel } from '@/components/prompt-selection/PromptSelectionPanel';
import { Trees, Box, Sparkles, Beaker } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_KEYS, VIDEO_KEYS } from '@/core/services/queryKeys';
export default function NewVideoPage() {
    console.log('[NewVideoPage] Component rendering');
    const { projectId: routeProjectId } = useParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { togglePromptPanel } = useShell();
    const { state, selectCategory } = usePromptSelection();
    const [imageState, setImageState] = useState({
        url: undefined,
        projectId: undefined,
        source: 'none',
    });
    const [projectVideos, setProjectVideos] = useState([]);
    const { data: categories = [] } = usePromptCategories();
    const queryClient = useQueryClient();
    console.log('[NewVideoPage] Initial state:', JSON.stringify({
        routeProjectId,
        hasImageUrl: !!imageState.url,
        projectVideosCount: projectVideos.length,
        categoriesCount: categories.length,
    }));
    // Select first category by default
    useEffect(() => {
        if (!state.selectedCategory && categories.length > 0) {
            console.log('[NewVideoPage] Selecting default category:', categories[0].id);
            selectCategory(categories[0].id);
        }
    }, [state.selectedCategory, selectCategory, categories]);
    // Get unified projectId
    const projectId = imageState.projectId || routeProjectId;
    console.log('[NewVideoPage] Using projectId:', projectId);
    const { data: project, isLoading, error: _error } = useProjectDetails(routeProjectId || null);
    useEffect(() => {
        if (project) {
            console.log('[NewVideoPage] Project details loaded:', JSON.stringify({
                hasImageUrl: !!project.imageUrl,
                hasVideos: !!project.videos,
                videosCount: project.videos?.length || 0,
            }));
        }
    }, [project]);
    // Handle videos update from the video generation component
    const handleVideosUpdate = useCallback((videos) => {
        console.log('[NewVideoPage] handleVideosUpdate called with:', JSON.stringify({
            videosCount: videos.length,
            firstVideoId: videos.length > 0 ? videos[0]?.id : 'none',
            currentProjectVideosCount: projectVideos.length,
        }));
        // Convert videos to the format expected by VideoList
        const processedVideos = videos.map(v => {
            // Handle both url and videoUrl properties
            const videoUrl = v.url || v.videoUrl || null;
            // Handle 'pending' status by converting it to 'queued'
            let videoStatus = v.status;
            if (videoStatus === 'pending') {
                videoStatus = 'queued';
            }
            return {
                id: v.id,
                url: videoUrl,
                status: videoStatus,
                prompt: v.prompt,
                createdAt: v.createdAt || new Date().toISOString(),
                metadata: v.metadata || {}
            };
        });
        console.log('[NewVideoPage] Setting processed videos:', processedVideos);
        setProjectVideos(processedVideos);
    }, [projectVideos]);
    // Handle video generation completion
    const handleGenerationComplete = useCallback(() => {
        console.log('[NewVideoPage] Generation completed callback executed');
        console.log('[NewVideoPage] Current projectVideos state:', JSON.stringify({
            videosCount: projectVideos.length,
            videoIds: projectVideos.map((v) => v.id),
        }));
        // Determine the best projectId to use
        let effectiveProjectId = projectId;
        // If projectId is undefined, try to use imageState.projectId as fallback
        if (!effectiveProjectId && imageState.projectId) {
            console.log('[NewVideoPage] Using imageState.projectId as fallback:', imageState.projectId);
            effectiveProjectId = imageState.projectId;
        }
        // Force refetch videos using React Query cache invalidation
        if (effectiveProjectId) {
            console.log('[NewVideoPage] Invalidating project-videos query for project:', effectiveProjectId);
            queryClient.invalidateQueries({
                queryKey: PROJECT_KEYS.videos(effectiveProjectId),
            });
            // Also invalidate project details query
            console.log('[NewVideoPage] Invalidating project-details query for project:', effectiveProjectId);
            queryClient.invalidateQueries({
                queryKey: PROJECT_KEYS.detail(effectiveProjectId),
            });
            // Also invalidate any video generation queries
            queryClient.invalidateQueries({
                queryKey: VIDEO_KEYS.all,
            });
            console.log('[NewVideoPage] Query invalidation complete');
        }
        else {
            console.warn('[NewVideoPage] No projectId available for query invalidation - falling back to invalidating all projects');
            // Fallback: invalidate all project-related queries
            queryClient.invalidateQueries({
                queryKey: PROJECT_KEYS.all,
            });
            queryClient.invalidateQueries({
                queryKey: VIDEO_KEYS.all,
            });
        }
    }, [projectId, imageState.projectId, projectVideos, queryClient]);
    // Create a mock video for testing
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createMockVideo = useCallback(() => {
        console.log('[NewVideoPage] Creating mock video');
        // Use real generation data from the database
        return {
            id: '0e3ae618-be36-4e55-8c4a-e578077838b7',
            url: 'https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/videos/c213a8bc-8c04-4ce3-97e7-a61699340d5e/4eaabdcc-1952-47e9-be75-f97883934e0b/video-0e3ae618-be36-4e55-8c4a-e578077838b7.mp4',
            status: 'completed',
            prompt: 'Office + Close-up + Floating',
            createdAt: '2025-02-28T21:07:07.344Z',
            metadata: {
                thumbnailUrl: undefined,
                duration: undefined,
            },
        };
    }, []);
    // Create a direct video object without any mapping
    const createDirectVideo = useCallback(() => {
        console.log('[NewVideoPage] Creating direct video object');
        // Create a video object directly with the correct URL
        const video = {
            id: '0e3ae618-be36-4e55-8c4a-e578077838b7',
            url: 'https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/videos/c213a8bc-8c04-4ce3-97e7-a61699340d5e/4eaabdcc-1952-47e9-be75-f97883934e0b/video-0e3ae618-be36-4e55-8c4a-e578077838b7.mp4',
            status: 'completed',
            prompt: 'Office + Close-up + Floating',
            createdAt: '2025-02-28T21:07:07.344Z',
            metadata: {
                thumbnailUrl: undefined,
                duration: undefined,
            },
        };
        console.log('[NewVideoPage] Created direct video:', JSON.stringify({
            id: video.id,
            url: video.url,
            hasUrl: !!video.url,
            status: video.status,
        }));
        return video;
    }, []);
    // Simplified test function that bypasses the complex polling simulation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSimpleTest = useCallback(() => {
        console.log('[NewVideoPage] Simple test button clicked');
        // Create a direct video object with the correct URL
        const directVideo = createDirectVideo();
        // Update the state directly
        console.log('[NewVideoPage] Setting projectVideos state with direct video');
        setProjectVideos([directVideo]);
        // Call the completion callback
        console.log('[NewVideoPage] Calling handleGenerationComplete');
        handleGenerationComplete();
        console.log('[NewVideoPage] Simple test complete');
    }, [createDirectVideo, handleGenerationComplete]);
    // Test function to simulate video generation completion with real polling
    const handleTestUpdate = useCallback(() => {
        console.log('[NewVideoPage] Test update button clicked');
        // Use a real generation ID that we know is already completed
        const realGenerationId = '0e3ae618-be36-4e55-8c4a-e578077838b7';
        const realProjectId = '4eaabdcc-1952-47e9-be75-f97883934e0b';
        console.log(`[NewVideoPage] Starting test with real generation ID: ${realGenerationId} and project ID: ${realProjectId}`);
        // Import the services we need
        import('@/core/services/videos/status/service').then(({ VideoStatusService }) => {
            const videoStatusService = VideoStatusService.getInstance();
            console.log('[NewVideoPage] Checking video status once');
            videoStatusService
                .checkStatus(realGenerationId)
                .then((result) => {
                console.log('[NewVideoPage] Status check result:', result);
                if (result.data) {
                    console.log(`[NewVideoPage] Video status: ${result.data.status}`);
                    // Handle 'pending' status by converting it to 'queued'
                    let status = result.data.status;
                    if (status === 'pending') {
                        status = 'queued';
                    }
                    // Create a standardized video object
                    const standardizedVideo = {
                        id: realGenerationId,
                        url: result.data.videoUrl || null,
                        status: status,
                        prompt: 'Test video from status endpoint',
                        createdAt: new Date().toISOString(),
                        metadata: {
                            thumbnailUrl: undefined,
                            duration: undefined,
                        },
                    };
                    // Update the videos state directly
                    console.log('[NewVideoPage] Updating videos state with standardized video:', standardizedVideo);
                    setProjectVideos([standardizedVideo]);
                    // Call handleGenerationComplete to refresh data
                    console.log('[NewVideoPage] Calling handleGenerationComplete');
                    handleGenerationComplete();
                }
                else {
                    console.error('[NewVideoPage] No data returned from status check');
                }
            })
                .catch((err) => {
                console.error('[NewVideoPage] Error checking video status:', err);
            });
        });
    }, [handleGenerationComplete]);
    const { prompt, isGenerating, canGenerate, error: videoError, setPrompt, handleGenerate, } = useVideoGeneration({
        projectId,
        onVideosUpdate: handleVideosUpdate,
        imageUrl: imageState.url,
        onGenerationComplete: handleGenerationComplete,
    });
    console.log('[NewVideoPage] Video generation hook configured:', JSON.stringify({
        hasPrompt: !!prompt,
        isGenerating,
        canGenerate,
        hasError: !!videoError,
    }));
    // Generate prompt from selected options
    const generatedPrompt = useMemo(() => {
        const selectedOptions = Object.values(state.selectedOptions);
        if (selectedOptions.length === 0)
            return '';
        const promptText = selectedOptions.map((option) => option.text).join(' + ');
        console.log('[NewVideoPage] Generated prompt:', promptText);
        return promptText;
    }, [state.selectedOptions]);
    // Set prompt when generatedPrompt changes
    useEffect(() => {
        if (generatedPrompt) {
            console.log('[NewVideoPage] Setting prompt from generatedPrompt:', generatedPrompt);
            setPrompt(generatedPrompt);
        }
    }, [generatedPrompt, setPrompt]);
    const handleGenerateClick = useCallback(() => {
        console.log('[NewVideoPage] Generate button clicked');
        // Ensure we have both a prompt and image before proceeding
        if (!generatedPrompt) {
            console.warn('[NewVideoPage] Cannot generate: No prompt available');
            return;
        }
        if (!imageState.url) {
            console.warn('[NewVideoPage] Cannot generate: No image available');
            return;
        }
        // Force set the prompt one more time to ensure it's up to date
        console.log('[NewVideoPage] Setting final prompt before generation:', generatedPrompt);
        setPrompt(generatedPrompt);
        // Use a small timeout to ensure state is updated
        console.log('[NewVideoPage] Scheduling handleGenerate with timeout');
        setTimeout(() => {
            console.log('[NewVideoPage] Executing handleGenerate');
            handleGenerate();
        }, 50);
    }, [handleGenerate, generatedPrompt, imageState.url, setPrompt]);
    // Check if we can generate - need image and at least one option
    const canGenerateVideo = useMemo(() => {
        const hasImage = !!imageState.url;
        const hasSelectedOption = Object.keys(state.selectedOptions).length > 0;
        const canGenerate = hasImage && hasSelectedOption;
        console.log('[NewVideoPage] Can generate video:', JSON.stringify({
            hasImage,
            hasSelectedOption,
            canGenerate,
        }));
        return canGenerate;
    }, [imageState.url, state.selectedOptions]);
    const handleImageUploadSuccess = (result) => {
        console.log('[NewVideoPage] Image upload success:', JSON.stringify({
            hasImageUrl: !!result.imageUrl,
            hasProjectId: !!result.projectId,
        }));
        if (result.imageUrl && result.projectId) {
            setImageState({
                url: result.imageUrl,
                projectId: result.projectId,
                source: 'upload',
            });
            console.log('[NewVideoPage] Updated imageState with uploaded image');
        }
    };
    // Sync with route/project changes
    useEffect(() => {
        if (routeProjectId && project?.imageUrl) {
            console.log('[NewVideoPage] Syncing imageState with project from route:', JSON.stringify({
                routeProjectId,
                imageUrl: project.imageUrl,
            }));
            setImageState({
                url: project.imageUrl,
                projectId: routeProjectId,
                source: 'route',
            });
        }
    }, [routeProjectId, project]);
    // Use videos from project data directly when possible, falling back to projectVideos state
    // This ensures we're using the most up-to-date data from React Query
    const videos = useMemo(() => {
        let videoList = [];
        if (project?.videos && project.videos.length > 0) {
            console.log('[NewVideoPage] Using videos from project data:', project.videos.length);
            videoList = project.videos;
        }
        else if (projectVideos.length > 0) {
            console.log('[NewVideoPage] Using videos from projectVideos state:', projectVideos.length);
            videoList = projectVideos;
        }
        else {
            console.log('[NewVideoPage] No videos available');
            return [];
        }
        // Sort videos by creation date (newest first)
        return [...videoList].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [project?.videos, projectVideos]);
    console.log('[NewVideoPage] Final videos for rendering:', JSON.stringify({
        count: videos.length,
        source: project?.videos && project.videos.length > 0 ? 'project.videos' : 'projectVideos',
        ids: videos.slice(0, 3).map((v) => v.id), // Log first 3 IDs for debugging
    }));
    return (_jsx("div", { className: "h-full", children: _jsxs("div", { className: "flex h-full", children: [_jsxs("div", { className: "w-[400px] shrink-0 bg-[hsl(var(--page-background))] px-6 flex flex-col h-full", children: [videoError && (_jsx(Alert, { variant: "destructive", className: "mb-4 mt-10", children: _jsx(AlertDescription, { children: typeof videoError === 'object' && videoError !== null
                                    ? videoError.message || JSON.stringify(videoError)
                                    : videoError }) })), routeProjectId && isLoading ? (_jsx("div", { className: "aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-10", children: _jsx(Spinner, { size: "lg" }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "pt-10", children: [_jsx(ImageUpload, { onSuccess: handleImageUploadSuccess, onUploadComplete: (url) => {
                                                if (url && url !== imageState.url) {
                                                    console.log('[NewVideoPage] Image upload complete with URL');
                                                    setImageState((prev) => ({
                                                        ...prev,
                                                        url,
                                                        source: 'upload',
                                                    }));
                                                }
                                            }, existingImageUrl: imageState.url, className: "w-full" }), _jsx("div", { className: "mt-4", children: _jsx("div", { className: "grid grid-cols-3 gap-3 px-0", children: categories.map((category) => {
                                                    const icons = {
                                                        environment: Trees,
                                                        product: Box,
                                                        dynamic: Sparkles,
                                                    };
                                                    const Icon = icons[category.id];
                                                    const selectedOption = state.selectedOptions[category.id];
                                                    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "text-sm font-medium mb-1 text-muted-foreground", children: category.name }), _jsx(Button, { variant: "outline", className: `
                              relative w-[104px] h-[104px] p-0 overflow-hidden group
                              border-2 hover:bg-transparent hover:border-primary
                              ${state.selectedCategory === category.id ? 'border-primary bg-transparent' : 'bg-transparent'}
                            `, onClick: () => {
                                                                    console.log('[NewVideoPage] Category selected:', category.id);
                                                                    selectCategory(category.id);
                                                                }, children: selectedOption ? (_jsxs(_Fragment, { children: [_jsx("img", { src: selectedOption.imageUrl, alt: selectedOption.text, className: "absolute inset-0 w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center p-2", children: _jsx("span", { className: "text-xs text-white bg-black/40 px-2 py-1 rounded-sm text-center leading-tight", children: selectedOption.text.length > 10
                                                                                    ? `${selectedOption.text.slice(0, 10)}...`
                                                                                    : selectedOption.text }) })] })) : (_jsx(_Fragment, { children: _jsx(Icon, { className: "h-6 w-6" }) })) })] }, category.id));
                                                }) }) })] }), _jsx("div", { className: "flex-1 overflow-auto mt-4 mb-[88px]", children: _jsxs("div", { className: "bg-muted/30 rounded-lg p-4", children: [_jsxs("h3", { className: "text-sm font-medium mb-3 text-muted-foreground", children: [categories.find((c) => c.id === state.selectedCategory)?.name, " Options"] }), _jsx(PromptSelectionPanel, {})] }) }), _jsxs("div", { className: "fixed bottom-10 w-[352px] bg-[hsl(var(--page-background))] pt-4 space-y-2", children: [generatedPrompt && (_jsx("div", { className: "px-2 py-1.5 text-sm bg-muted/50 rounded-md", children: generatedPrompt })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { className: "flex-1", size: "lg", disabled: !canGenerateVideo, onClick: handleGenerateClick, children: [isGenerating ? _jsx(Spinner, { className: "mr-2", size: "sm" }) : null, "Generate Video"] }), _jsxs(Button, { variant: "outline", size: "lg", onClick: handleTestUpdate, className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 flex items-center", children: [_jsx(Beaker, { className: "h-4 w-4 mr-2" }), "Test Update"] })] })] })] }))] }), _jsx("div", { className: "flex-1 bg-[hsl(var(--highlight-background))] px-6 pt-10", children: _jsx("div", { className: "flex justify-center", children: _jsx(VideoList, { videos: videos, isLoading: isLoading || isGenerating, error: videoError ? new Error(videoError) : null, mode: routeProjectId ? 'edit' : 'new', layout: "stack", size: "large" }) }) })] }) }));
}
