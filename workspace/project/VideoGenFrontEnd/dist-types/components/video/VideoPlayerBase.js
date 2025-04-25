import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, PlayCircle } from 'lucide-react';
import { debugLog, updateVideoPlayerState } from '@/lib/utils/debug';
const SIZES = {
    default: 300,
    large: 500,
};
// Debug function to log with component ID for tracing
const logVideoPlayer = (videoId, message, data) => {
    debugLog(`VideoPlayer:${videoId}`, message, data);
    // Update global state tracking
    if (data) {
        const updates = {};
        if ('videoUrl' in data)
            updates.videoUrl = data.videoUrl;
        if ('status' in data)
            updates.status = data.status;
        if ('isLoading' in data)
            updates.isLoading = data.isLoading;
        if ('isPlaying' in data)
            updates.isPlaying = data.isPlaying;
        if ('videoReadyState' in data)
            updates.readyState = data.videoReadyState;
        if ('error' in data)
            updates.error = data.error;
        if (Object.keys(updates).length > 0) {
            updateVideoPlayerState(videoId, updates);
        }
    }
};
export function VideoPlayerBase({ videoId, videoUrl, status = 'completed', className, size = 'default', }) {
    // Core state - keep it minimal
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Refs
    const videoRef = useRef(null);
    const mountTimeRef = useRef(Date.now());
    const componentIdRef = useRef(`${videoId}_${Math.random().toString(36).substring(2, 9)}`);
    const componentId = componentIdRef.current;
    const timeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    // Calculate height based on 16:9 ratio
    const width = SIZES[size];
    const height = Math.round((width * 9) / 16);
    // Safe state setter that checks if component is still mounted
    const safeSetIsLoading = (value) => {
        if (isMountedRef.current) {
            setIsLoading(value);
            logVideoPlayer(componentId, `Setting isLoading to ${value}`, {
                videoId,
                videoUrl,
                videoReadyState: videoRef.current?.readyState
            });
            updateVideoPlayerState(componentId, { isLoading: value });
        }
    };
    // Log component mount with props
    useEffect(() => {
        isMountedRef.current = true;
        logVideoPlayer(componentId, 'Component mounted', {
            videoId,
            videoUrl,
            status,
            mountTime: new Date().toISOString()
        });
        // Initialize global state tracking
        updateVideoPlayerState(componentId, {
            videoUrl,
            status,
            isLoading: false,
            isPlaying: false
        });
        // Set initial loading state based on URL
        if (videoUrl) {
            safeSetIsLoading(true);
        }
        return () => {
            // Mark component as unmounted to prevent state updates
            isMountedRef.current = false;
            // Clear any pending timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            logVideoPlayer(componentId, 'Component unmounting', {
                timeElapsed: Date.now() - mountTimeRef.current,
                videoId,
                videoUrl,
                status,
                finalLoadingState: isLoading
            });
        };
    }, [componentId, videoId, videoUrl, status]);
    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl)
            return;
        // Set safety timeout - absolute maximum time to show spinner
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            safeSetIsLoading(false);
            logVideoPlayer(componentId, 'Safety timeout triggered', {
                videoId,
                videoReadyState: video.readyState
            });
        }, 8000);
        // Force preload to auto
        video.preload = 'auto';
        // Set initial loading state
        safeSetIsLoading(true);
        logVideoPlayer(componentId, 'Setting up video event listeners', {
            videoId,
            initialReadyState: video.readyState,
            videoUrl,
            preload: video.preload
        });
        // Event handlers - keep them simple and focused
        const onCanPlay = () => {
            logVideoPlayer(componentId, 'Video canplay event', {
                videoId,
                readyState: video.readyState
            });
            if (video.readyState >= 3) {
                safeSetIsLoading(false);
            }
        };
        const onPlaying = () => {
            logVideoPlayer(componentId, 'Video playing event', {
                videoId,
                readyState: video.readyState
            });
            if (isMountedRef.current) {
                setIsPlaying(true);
                safeSetIsLoading(false);
            }
        };
        const onWaiting = () => {
            logVideoPlayer(componentId, 'Video waiting/stalled event', {
                videoId,
                readyState: video.readyState
            });
            if (video.readyState < 3) {
                safeSetIsLoading(true);
            }
        };
        const onError = () => {
            logVideoPlayer(componentId, 'Video error event', {
                videoId,
                error: video.error
            });
            safeSetIsLoading(false);
        };
        const onPause = () => {
            if (isMountedRef.current) {
                setIsPlaying(false);
            }
        };
        // Add event listeners
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('stalled', onWaiting);
        video.addEventListener('error', onError);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onPause);
        // Check initial state
        if (video.readyState >= 3) {
            safeSetIsLoading(false);
        }
        // Clean up
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            // Remove all event listeners
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('stalled', onWaiting);
            video.removeEventListener('error', onError);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onPause);
        };
    }, [componentId, videoId, videoUrl]);
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            }
            else {
                try {
                    // Show loading spinner while attempting to play
                    safeSetIsLoading(true);
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            logVideoPlayer(componentId, 'Error playing video', {
                                videoId,
                                error
                            });
                            // Hide spinner if play fails
                            safeSetIsLoading(false);
                        });
                    }
                }
                catch (error) {
                    logVideoPlayer(componentId, 'Exception playing video', {
                        videoId,
                        error
                    });
                    // Hide spinner if play throws an exception
                    safeSetIsLoading(false);
                }
            }
        }
    };
    const handleDownload = () => {
        if (videoUrl) {
            logVideoPlayer(componentId, 'Downloading video', { videoId });
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = `video-${videoId}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    // Handle different states based on URL and status
    if (!videoUrl) {
        logVideoPlayer(componentId, 'Rendering no-URL state', {
            videoId,
            status
        });
        // For videos with no URL
        if (status === 'completed' || status === 'failed') {
            // Show placeholder for completed or failed videos with no URL
            return (_jsxs("div", { className: "flex flex-col items-center justify-center bg-muted rounded-lg", style: { width, height }, children: [_jsx(PlayCircle, { className: "w-8 h-8 mb-2 text-muted-foreground" }), _jsx("p", { className: "text-xs text-muted-foreground", children: status === 'failed' ? 'Video generation failed' : 'No video available' })] }));
        }
        else {
            // Show spinner for videos still in progress
            return (_jsx("div", { className: "flex items-center justify-center bg-transparent rounded-lg", style: { width, height }, children: _jsx(Spinner, { size: "lg", className: "text-muted-foreground", "data-video-id": videoId }) }));
        }
    }
    logVideoPlayer(componentId, 'Rendering video player', {
        videoId,
        isLoading,
        isPlaying,
        videoReadyState: videoRef.current?.readyState
    });
    return (_jsxs("div", { className: "group relative bg-transparent rounded-lg overflow-hidden", style: { width, height }, "data-video-id": videoId, "data-loading": isLoading, children: [_jsx("video", { ref: videoRef, src: videoUrl, playsInline: true, preload: "auto", onClick: togglePlay, className: cn('w-full h-full object-cover cursor-pointer rounded-lg bg-transparent', className) }), isLoading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-transparent rounded-lg", children: _jsx(Spinner, { size: "lg", className: "text-muted-foreground", "data-video-id": videoId }) }, `spinner-${videoId}`)), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: [_jsx("button", { onClick: togglePlay, className: "p-1 text-white hover:text-primary transition-colors", children: isPlaying ? _jsx(Pause, { size: 20 }) : _jsx(Play, { size: 20 }) }), _jsx("button", { onClick: handleDownload, className: "p-1 text-white hover:text-primary transition-colors", children: _jsx(Download, { size: 20 }) })] })] }));
}
