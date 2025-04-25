import { useParams } from 'react-router-dom';
import { ImageUpload } from '@/components/video/ImageUpload';
import { VideoList } from '@/components/video/VideoList';
import { useVideoGeneration } from '@/core/hooks/video';
import { useProjectDetails } from '@/core/hooks/projects';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ImageUploadResult } from '@/core/services/images';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isVideo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isVideoGeneration,
} from '@/core/services/videos/types';
import type { Video } from '@/core/services/videos';
import { mapGenerationsToVideos } from '@/core/services/videos/mappers';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/button';
import { useShell } from '@/shell/MainShell';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { useAllPromptData } from '@/core/hooks/prompts';
import { PromptSelectionPanel } from '@/components/prompt-selection/PromptSelectionPanel';
import { Trees, Box, Sparkles, Beaker, AlertCircle, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Generation } from '@/core/services/projects';
import { PROJECT_KEYS, VIDEO_KEYS } from '@/core/services/queryKeys';
import { useTokenBalance } from '@/core/services/payment/hooks';
import { useNavigate } from 'react-router-dom';

// Define minimum credits required for video generation
const MIN_CREDITS_FOR_VIDEO = 10;

interface ImageState {
  url: string | undefined;
  projectId: string | undefined;
  source: 'upload' | 'route' | 'none';
}

// Credit Modal Component
const CreditModal = ({ 
  isOpen, 
  onClose, 
  onPurchase, 
  currentBalance = 0,
  requiredCredits = MIN_CREDITS_FOR_VIDEO
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onPurchase: () => void;
  currentBalance?: number;
  requiredCredits?: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Insufficient Credits
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-5">
          <p className="text-sm text-gray-600 mb-2">
            You need at least {requiredCredits} credit to generate a video.
          </p>
          <p className="text-sm font-medium">
            Your current balance: <span className="text-red-500">{currentBalance} credit{currentBalance !== 1 ? 's' : ''}</span>
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={onPurchase}
          >
            Purchase Credits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function NewVideoPage() {
  console.log('[NewVideoPage] Component rendering');

  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { togglePromptPanel } = useShell();
  const { state, selectCategory, getSelectedPromptText, clearSelection } = usePromptSelection();
  const [imageState, setImageState] = useState<ImageState>({
    url: undefined,
    projectId: undefined,
    source: 'none',
  });
  const [projectVideos, setProjectVideos] = useState<Video[]>([]);
  const queryClient = useQueryClient();
  
  // Add navigate for redirecting to Credits page
  const navigate = useNavigate();
  
  // Add token balance hook
  const { balance, loading: balanceLoading } = useTokenBalance();
  
  // Add state for credit modal
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Use the new hook that fetches all data at once
  const { categories = [] } = useAllPromptData();

  // Ensure categories are loaded and a category is selected
  useEffect(() => {
    console.log('[NewVideoPage] Ensuring categories are loaded and a category is selected');
    
    // If categories are loaded but no category is selected, select the first one
    if (categories.length > 0 && !state.selectedCategory) {
      console.log('[NewVideoPage] Selecting first category:', categories[0].id);
      selectCategory(categories[0].id);
    }
  }, [categories, state.selectedCategory, selectCategory]);

  // Reset state when component mounts
  useEffect(() => {
    // Only reset if there's no route project ID
    if (!routeProjectId) {
      console.log('[NewVideoPage] Resetting state on mount (no projectId in route)');
      
      // Reset image state
      setImageState({
        url: undefined,
        projectId: undefined,
        source: 'none',
      });
      
      // Reset project videos
      setProjectVideos([]);
      
      // Reset prompt selection and select first category
      clearSelection();
      
      // Select the first category if available
      if (categories.length > 0) {
        console.log('[NewVideoPage] Re-selecting default category after reset:', categories[0].id);
        selectCategory(categories[0].id);
      }
    }
  }, [routeProjectId, clearSelection, categories, selectCategory]);

  console.log(
    '[NewVideoPage] Initial state:',
    JSON.stringify({
      routeProjectId,
      hasImageUrl: !!imageState.url,
      projectVideosCount: projectVideos.length,
      categoriesCount: categories.length,
    }),
  );

  // Select first category by default
  useEffect(() => {
    if (categories.length > 0) {
      console.log('[NewVideoPage] Selecting default category:', categories[0].id);
      selectCategory(categories[0].id);
    }
  }, [selectCategory, categories]);

  // Get unified projectId
  const projectId = imageState.projectId || routeProjectId;

  console.log('[NewVideoPage] Using projectId:', projectId);

  const { data: project, isLoading, error: _error } = useProjectDetails(routeProjectId || null);

  useEffect(() => {
    if (project) {
      console.log(
        '[NewVideoPage] Project details loaded:',
        JSON.stringify({
          hasImageUrl: !!project.imageUrl,
          hasVideos: !!project.videos,
          videosCount: project.videos?.length || 0,
        }),
      );
    }
  }, [project]);

  // Handle videos update from the video generation component
  const handleVideosUpdate = useCallback(
    (videos: any[]) => {
      console.log(
        '[NewVideoPage] handleVideosUpdate called with:',
        JSON.stringify({
          videosCount: videos.length,
          firstVideoId: videos.length > 0 ? videos[0]?.id : 'none',
          currentProjectVideosCount: projectVideos.length,
        }),
      );

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
    },
    [projectVideos],
  );

  // Handle video generation completion
  const handleGenerationComplete = useCallback(() => {
    console.log('[NewVideoPage] Generation completed callback executed');
    console.log(
      '[NewVideoPage] Current projectVideos state:',
      JSON.stringify({
        videosCount: projectVideos.length,
        videoIds: projectVideos.map((v) => v.id),
      }),
    );

    // Determine the best projectId to use
    let effectiveProjectId = projectId;

    // If projectId is undefined, try to use imageState.projectId as fallback
    if (!effectiveProjectId && imageState.projectId) {
      console.log('[NewVideoPage] Using imageState.projectId as fallback:', imageState.projectId);
      effectiveProjectId = imageState.projectId;
    }

    // Force refetch videos using React Query cache invalidation
    if (effectiveProjectId) {
      console.log(
        '[NewVideoPage] Invalidating project-videos query for project:',
        effectiveProjectId,
      );
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.videos(effectiveProjectId),
      });

      // Also invalidate project details query
      console.log(
        '[NewVideoPage] Invalidating project-details query for project:',
        effectiveProjectId,
      );
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(effectiveProjectId),
      });

      // Also invalidate any video generation queries
      queryClient.invalidateQueries({
        queryKey: VIDEO_KEYS.all,
      });

      console.log('[NewVideoPage] Query invalidation complete');
    } else {
      console.warn(
        '[NewVideoPage] No projectId available for query invalidation - falling back to invalidating all projects',
      );

      // Fallback: invalidate all project-related queries
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.all,
      });

      queryClient.invalidateQueries({
        queryKey: VIDEO_KEYS.all,
      });
    }
  }, [projectId, imageState.projectId, projectVideos, queryClient]);

  const {
    prompt,
    isGenerating,
    canGenerate,
    error: videoError,
    setPrompt,
    handleGenerate,
  } = useVideoGeneration({
    projectId,
    onVideosUpdate: handleVideosUpdate,
    imageUrl: imageState.url,
    onGenerationComplete: handleGenerationComplete,
    onInsufficientCredits: () => {
      console.log('[NewVideoPage] Redirecting to Credits page due to insufficient credits');
      navigate('/credits');
    },
  });

  console.log(
    '[NewVideoPage] Video generation hook configured:',
    JSON.stringify({
      hasPrompt: !!prompt,
      isGenerating,
      canGenerate,
      hasError: !!videoError,
    }),
  );

  // Generate prompt from selected options
  const generatedPrompt = useMemo(() => {
    // Use the getSelectedPromptText function from context
    const promptText = getSelectedPromptText();
    
    // Debug log to see the raw prompt text from context
    console.log('[NewVideoPage] Raw prompt text from context:', promptText);
    
    // More detailed debugging for selected options
    console.log('[NewVideoPage] Current selected options:', JSON.stringify({
      allOptions: state.selectedOptions,
      hasMotion: 'motion' in state.selectedOptions,
      motionOption: state.selectedOptions['motion'],
      motionText: state.selectedOptions['motion']?.text
    }));
    
    // Only add "static shot" prefix if no motion option is selected
    const hasMotionOption = 'motion' in state.selectedOptions;
    const finalPrompt = promptText 
      ? hasMotionOption 
        ? promptText  // No "static shot" prefix for motion shots
        : `static shot: ${promptText}`  // Add prefix only for static shots
      : '';
    
    console.log('[NewVideoPage] Generated prompt:', finalPrompt);
    return finalPrompt;
  }, [getSelectedPromptText, state.selectedOptions]);

  // Set prompt when generatedPrompt changes
  useEffect(() => {
    if (generatedPrompt) {
      console.log('[NewVideoPage] Setting prompt from generatedPrompt:', generatedPrompt);
      setPrompt(generatedPrompt);
    }
  }, [generatedPrompt, setPrompt]);

  // Handle Generate button click
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

    // Check if user has enough credits
    if (!balanceLoading && balance !== undefined && balance < MIN_CREDITS_FOR_VIDEO) {
      console.log('[NewVideoPage] Insufficient credits, showing modal');
      setShowCreditModal(true);
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
  }, [generatedPrompt, imageState.url, setPrompt, handleGenerate, balance, balanceLoading]);

  // Can we generate a video?
  const canGenerateVideo = useMemo(() => {
    // Ensure we have an image and some options selected
    const hasImageAndOptions = imageState.url && Object.keys(state.selectedOptions).length > 0;
    
    // Check if we have enough credits (only when balance is loaded)
    const hasEnoughCredits = balanceLoading ? true : (balance !== undefined && balance >= MIN_CREDITS_FOR_VIDEO);
    
    // Final check combines all requirements
    const canGenerate = hasImageAndOptions && hasEnoughCredits && !isGenerating;
    
    console.log('[NewVideoPage] Can generate video:', JSON.stringify({
      hasImageAndOptions,
      hasEnoughCredits,
      balance,
      isGenerating,
      canGenerate
    }));
    
    return canGenerate;
  }, [imageState.url, state.selectedOptions, balance, balanceLoading, isGenerating]);

  const handleImageUploadSuccess = (result: ImageUploadResult) => {
    console.log(
      '[NewVideoPage] Image upload success:',
      JSON.stringify({
        hasImageUrl: !!result.imageUrl,
        hasProjectId: !!result.projectId,
      }),
    );

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
      console.log(
        '[NewVideoPage] Syncing imageState with project from route:',
        JSON.stringify({
          routeProjectId,
          imageUrl: project.imageUrl,
        }),
      );

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
    let videoList: Video[] = [];

    if (project?.videos && project.videos.length > 0) {
      console.log('[NewVideoPage] Using videos from project data:', project.videos.length);
      videoList = project.videos;
    } else if (projectVideos.length > 0) {
      console.log('[NewVideoPage] Using videos from projectVideos state:', projectVideos.length);
      videoList = projectVideos;
    } else {
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

  console.log(
    '[NewVideoPage] Final videos for rendering:',
    JSON.stringify({
      count: videos.length,
      source: project?.videos && project.videos.length > 0 ? 'project.videos' : 'projectVideos',
      ids: videos.slice(0, 3).map((v) => v.id), // Log first 3 IDs for debugging
    }),
  );

  return (
    <div className="h-full">
      <div className="flex h-full">
        {/* Left Column - Always rendered */}
        <div className="w-[400px] shrink-0 bg-[hsl(var(--page-background))] px-6 flex flex-col h-full">
          {/* Error message - conditionally rendered */}
          {videoError && (
            <Alert variant="destructive" className="mb-4 mt-10">
              <AlertDescription>
                {typeof videoError === 'object' && videoError !== null
                  ? (videoError as { message?: string }).message || JSON.stringify(videoError)
                  : videoError}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Top Section - Always rendered with conditional content */}
          <div className="pt-10">
            {routeProjectId && isLoading ? (
              <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Image Upload Component - Always shown */}
                <ImageUpload
                  onSuccess={handleImageUploadSuccess}
                  onUploadComplete={(url) => {
                    if (url && url !== imageState.url) {
                      console.log('[NewVideoPage] Image upload complete with URL');
                      setImageState((prev) => ({
                        ...prev,
                        url,
                        source: 'upload',
                      }));
                    }
                  }}
                  existingImageUrl={imageState.url}
                  className="w-full"
                />
              </>
            )}
          </div>

          {/* Category Buttons - Always rendered */}
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-3 px-0">
              {/* Sort categories in the desired order: Environment, Object, Motion/Dynamic */}
              {[...categories].sort((a, b) => {
                // Define the order: environment first, object second, dynamic/treatment third
                const order = { 'environment': 1, 'object': 2, 'dynamic': 3, 'treatment': 3, 'product': 4 };
                return (order[a.id as keyof typeof order] || 99) - (order[b.id as keyof typeof order] || 99);
              }).map((category) => {
                const icons = {
                  environment: Trees,
                  product: Box,
                  dynamic: Sparkles,
                  treatment: Sparkles,
                  object: Box
                };
                const Icon = icons[category.id as keyof typeof icons] || Beaker;
                const selectedOption = state.selectedOptions[category.id];

                return (
                  <div key={category.id} className="flex flex-col items-center">
                    <span className="text-sm font-medium mb-1 text-muted-foreground">
                      {category.name}
                    </span>
                    <Button
                      variant="outline"
                      className={`
                        relative w-[104px] h-[104px] p-0 overflow-hidden group
                        border-2 hover:bg-transparent hover:border-primary
                        ${state.selectedCategory === category.id ? 'border-primary bg-transparent' : 'bg-transparent'}
                      `}
                      onClick={() => {
                        console.log('[NewVideoPage] Category selected:', category.id);
                        
                        // Special debug for dynamic category
                        if (category.id === 'dynamic') {
                          console.log('[NewVideoPage] DYNAMIC category selected - checking current state:', 
                            JSON.stringify({
                              selectedCategory: state.selectedCategory,
                              hasSelectedOptions: Object.keys(state.selectedOptions).length,
                              dynamicOption: state.selectedOptions['dynamic']
                            })
                          );
                        }
                        
                        selectCategory(category.id);
                      }}
                    >
                      {selectedOption ? (
                        <>
                          <img
                            src={selectedOption.imageUrl}
                            alt={selectedOption.text}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">
                              {selectedOption.text}
                            </span>
                          </div>
                        </>
                      ) : (
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Options Area */}
          <div className="flex-1 overflow-auto mt-4 mb-[88px]">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                {categories.find((c) => c.id === state.selectedCategory)?.name || 'Select a'} Options
              </h3>
              <PromptSelectionPanel />
            </div>
          </div>

          {/* Bottom buttons - Always rendered */}
          <div className="fixed bottom-10 w-[352px] bg-[hsl(var(--page-background))] pt-4 space-y-2">
            {/* Prompt Display - Always rendered */}
            <div className="px-3 py-2.5 text-sm bg-muted/30 border border-muted rounded-md min-h-[40px] flex items-center mb-2">
              {generatedPrompt ? (
                <span>{generatedPrompt}</span>
              ) : (
                <span className="text-muted-foreground italic">Select options to generate a prompt...</span>
              )}
            </div>
            
            <div className="flex gap-2">
              {!balanceLoading && balance !== undefined && balance < MIN_CREDITS_FOR_VIDEO ? (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => navigate('/credits')}
                >
                  Get Credits
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={!canGenerateVideo}
                  onClick={handleGenerateClick}
                >
                  {isGenerating ? <Spinner className="mr-2" size="sm" /> : null}
                  Generate Video
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Always rendered */}
        <div className="flex-1 bg-[hsl(var(--highlight-background))] px-6 pt-10">
          <div className="flex justify-center">
            <VideoList
              videos={videos}
              isLoading={isLoading || isGenerating}
              error={videoError ? new Error(videoError) : null}
              mode={routeProjectId ? 'edit' : 'new'}
              layout="stack"
              size="large"
              responsive={false}
              showLoadingSpinner={true}
            />
          </div>
        </div>
      </div>
      
      {/* Credit Modal */}
      <CreditModal 
        isOpen={showCreditModal} 
        onClose={() => setShowCreditModal(false)} 
        onPurchase={() => navigate('/credits')}
        currentBalance={balance || 0}
        requiredCredits={MIN_CREDITS_FOR_VIDEO}
      />
    </div>
  );
}
