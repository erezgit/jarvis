import { jsx as _jsx } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { debugLog, trackSpinner, untrackSpinner } from '@/lib/utils/debug';
// Global spinner tracking
let activeSpinners = 0;
const spinnerIds = {};
// Debug function to log spinner lifecycle
const logSpinner = (id, action, data) => {
    debugLog(`Spinner:${id}`, action, {
        activeCount: activeSpinners,
        ...data
    });
};
export function Spinner({ className, size = 'sm', 'data-video-id': videoId }) {
    const spinnerId = useRef(`spinner_${Math.random().toString(36).substring(2, 9)}`);
    const id = spinnerId.current;
    const location = videoId ? `video:${videoId}` : 'unknown';
    useEffect(() => {
        // Track spinner creation
        activeSpinners++;
        spinnerIds[id] = true;
        logSpinner(id, 'Created', { className, videoId, location });
        // Track in global debug state
        trackSpinner(id, location);
        // Track spinner destruction
        return () => {
            activeSpinners--;
            delete spinnerIds[id];
            logSpinner(id, 'Destroyed', { className, videoId, location });
            // Update global debug state
            untrackSpinner(id);
        };
    }, [className, id, videoId, location]);
    const sizeClasses = {
        sm: 'w-4 h-4', // 16x16px
        lg: 'w-8 h-8', // 32x32px
    };
    return (_jsx(Loader2, { className: cn('animate-spin text-muted-foreground', sizeClasses[size], className), "data-spinner-id": id, "data-video-id": videoId }));
}
