import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function ProjectsList({ projects, className }) {
    if (projects.length === 0) {
        return _jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No projects found" });
    }
    return (_jsx("div", { className: cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className), children: projects.map((project) => (_jsxs("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: [_jsx("div", { className: "aspect-video relative", children: _jsx("img", { src: project.imageUrl, alt: project.prompt, className: "object-cover rounded-t-lg w-full h-full" }) }), _jsxs("div", { className: "p-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: project.prompt }), _jsx("div", { className: "mt-4", children: project.videos.length > 0 ? (_jsx("div", { className: "grid gap-2", children: project.videos.map((video) => (_jsx("video", { src: video.url, controls: true, className: "w-full rounded" }, video.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground", children: "No videos generated yet" })) })] })] }, project.id))) }));
}
