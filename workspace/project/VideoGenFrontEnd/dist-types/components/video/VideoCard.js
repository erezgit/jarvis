import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayerBase } from './VideoPlayerBase';
// Size constants to match VideoPlayerBase
const SIZES = {
    default: 300,
    large: 500,
};
export function VideoCard({ video, className, size = 'default' }) {
    // Get the exact width based on size
    const width = SIZES[size];
    return (_jsx(Card, { className: cn('border-0 bg-transparent', className), style: { width: `${width}px` }, children: _jsxs(CardContent, { className: "p-0", children: [_jsx(VideoPlayerBase, { videoId: video.id, videoUrl: video.url, status: video.status, size: size, className: className }), video.prompt && _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: video.prompt })] }) }));
}
