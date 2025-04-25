import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VideoCard } from './VideoCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import { Spinner } from '@/components/common/Spinner';
import { useState, useEffect, useRef } from 'react';
// Safety timeout to prevent infinite spinner
const SAFETY_TIMEOUT = 8000; // 8 seconds
export function VideoList({ videos = [], className, size = 'default', layout = 'grid', mode = 'new', isLoading = false, error = null, }) {
    const [showSpinner, setShowSpinner] = useState(isLoading);
    const safetyTimeoutRef = useRef(null);
    // Reset loading state when component unmounts
    useEffect(() => {
        return () => {
            if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
            }
        };
    }, []);
    // Update spinner visibility when isLoading prop changes
    useEffect(() => {
        // Clear any existing safety timeout
        if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
        }
        if (isLoading) {
            setShowSpinner(true);
            // Set a safety timeout to prevent infinite spinner
            safetyTimeoutRef.current = setTimeout(() => {
                console.warn('[VideoList] Safety timeout reached, hiding spinner');
                setShowSpinner(false);
            }, SAFETY_TIMEOUT);
        }
        else {
            setShowSpinner(false);
        }
        return () => {
            if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
            }
        };
    }, [isLoading]);
    if (showSpinner) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[169px]", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (error) {
        return (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error.message }) }));
    }
    // Show placeholder for new projects or when no videos exist
    if (!videos.length) {
        return (_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: cn('flex flex-col items-center justify-center bg-muted rounded-lg', className), style: {
                    width: size === 'large' ? '500px' : '300px',
                    height: '169px',
                }, children: _jsxs("div", { className: "text-center", children: [_jsx(PlayCircle, { className: "w-6 h-6 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: mode === 'new' ? 'Your video will appear here' : 'No videos generated yet' })] }) }) }));
    }
    // Sort videos by creation date (newest first)
    const sortedVideos = [...videos].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
    });
    return (_jsx("div", { className: cn('grid gap-5', className), children: sortedVideos.map((video) => (_jsx(VideoCard, { video: video, size: size }, video.id))) }));
}
