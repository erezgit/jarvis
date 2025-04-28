import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
export function ProjectCard({ project, loading = false, error = null }) {
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8 bg-muted rounded-lg", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    if (error) {
        return (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) }));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: project.prompt }) }), _jsxs(CardContent, { children: [_jsx("img", { src: project.imageUrl, alt: project.prompt, className: "w-full h-[200px] object-cover rounded-md mb-4" }), _jsx("div", { className: "space-y-4", children: project.videos.map((video) => (_jsx("video", { src: video.url, controls: true, className: "w-full rounded-md" }, video.id))) })] })] }));
}
