import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { VideoList } from '@/components/video/VideoList';
export function ProjectCard({ project, onSelect, className }) {
    const handleClick = () => {
        onSelect?.(project.id);
    };
    // Convert ProjectListItem videos to generations format if needed
    const generations = 'generations' in project
        ? project.generations
        : project.videos.map((video) => ({
            id: video.id,
            videoUrl: video.url,
            status: 'completed',
            prompt: project.prompt,
            createdAt: new Date().toISOString(),
            metadata: {},
        }));
    return (_jsx("div", { className: cn('overflow-hidden border-0 bg-transparent', className), children: _jsx("div", { className: "p-0", children: _jsxs("div", { className: "flex gap-5", children: [_jsxs("div", { className: "w-[300px] shrink-0 cursor-pointer group relative", onClick: handleClick, children: [_jsx("div", { className: "aspect-video", children: _jsx("img", { src: project.imageUrl, alt: project.prompt, className: "w-full h-full object-cover rounded-lg" }) }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-2", children: project.prompt })] }), _jsx("div", { className: "flex-1", children: _jsx("div", { className: "flex gap-5", children: _jsx(VideoList, { generations: generations, layout: "grid", mode: "edit" }) }) })] }) }) }));
}
