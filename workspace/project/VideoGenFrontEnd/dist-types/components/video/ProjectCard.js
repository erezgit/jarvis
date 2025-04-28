import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { VideoCard } from './VideoCard';
import { PlayCircle } from 'lucide-react';
export function ProjectCard({ project, onSelect, className }) {
    const handleClick = () => {
        onSelect?.(project.id);
    };
    // Format the date to a simplified version
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    // Sort videos by creation date (newest first)
    const sortedVideos = project.videos
        ? [...project.videos].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        })
        : [];
    return (_jsx(Card, { className: cn('overflow-hidden border-0 bg-transparent', className), children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "w-[300px] shrink-0 cursor-pointer", onClick: handleClick, children: [_jsx("div", { className: "aspect-video bg-muted rounded-lg overflow-hidden", children: project.imageUrl ? (_jsx("img", { src: project.imageUrl, alt: project.prompt || 'Project image', className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted", children: _jsx("span", { className: "text-sm text-muted-foreground", children: "No image available" }) })) }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: formatDate(project.createdAt) })] }), _jsx("div", { className: "flex-1", children: _jsx("div", { className: "flex flex-wrap gap-5", children: sortedVideos.length > 0 ? (sortedVideos.map((video) => (_jsx(VideoCard, { video: {
                                    ...video,
                                    prompt: project.prompt,
                                    status: video.status || 'completed',
                                } }, video.id)))) : (_jsxs("div", { className: "flex flex-col items-center justify-center bg-muted rounded-lg", style: {
                                    width: '300px',
                                    height: '169px',
                                }, children: [_jsx(PlayCircle, { className: "w-6 h-6 mx-auto mb-2 text-muted-foreground" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "No videos generated yet" })] })) }) })] }) }) }));
}
