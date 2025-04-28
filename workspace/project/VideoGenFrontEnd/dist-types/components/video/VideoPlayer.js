import { jsx as _jsx } from "react/jsx-runtime";
import { useVideoGeneration } from '@/core/hooks/video';
import { cn } from '@/lib/utils';
export function VideoPlayer({ videoId, className, projectId }) {
    const { videoUrl } = useVideoGeneration({ projectId });
    // Calculate height based on 16:9 ratio
    const width = 300;
    const height = Math.round((width * 9) / 16); // This will be 169px
    if (!videoUrl) {
        return (_jsx("div", { className: "flex items-center justify-center h-full bg-muted rounded-lg", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Video not found" }) }));
    }
    return (_jsx("div", { className: "group relative", style: { width: `${width}px`, height: `${height}px` }, children: _jsx("video", { src: videoUrl, controls: true, className: cn('w-full h-full object-cover rounded-lg [&::-webkit-media-controls-panel]:!bg-transparent', '[&::-webkit-media-controls-panel]:opacity-0 group-hover:[&::-webkit-media-controls-panel]:opacity-100', '[&::-webkit-media-controls-panel]:transition-opacity [&::-webkit-media-controls-panel]:duration-300', className), style: {
                width: `${width}px`,
                height: `${height}px`,
            } }) }));
}
