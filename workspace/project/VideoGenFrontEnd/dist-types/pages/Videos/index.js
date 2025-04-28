import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/core/hooks/projects';
import { ProjectCard } from '@/components/video/ProjectCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { Spinner } from '@/components/common/Spinner';
function LoadingState() {
    return (_jsxs("div", { className: "h-full overflow-hidden flex flex-col", children: [_jsx("div", { className: "flex-none px-10 pt-6", children: _jsx(PageHeader, { title: "Videos", className: "text-2xl font-bold tracking-tight" }) }), _jsx("div", { className: "flex items-center justify-center flex-1", children: _jsx(Spinner, { size: "lg" }) })] }));
}
function PageContent() {
    const navigate = useNavigate();
    const { data: projects, isLoading, error } = useProjects();
    const handleProjectSelect = useCallback((projectId) => {
        navigate(`/videos/new/${projectId}`);
    }, [navigate]);
    // Sort projects by creation date (newest first)
    const sortedProjects = useMemo(() => {
        if (!projects || projects.length === 0)
            return [];
        return [...projects].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [projects]);
    if (isLoading) {
        return _jsx(LoadingState, {});
    }
    if (error) {
        return (_jsx(Alert, { variant: "destructive", children: _jsxs(AlertDescription, { children: [error.message, _jsx("button", { onClick: () => window.location.reload(), className: "block w-full mt-2 text-sm underline hover:no-underline", children: "Try refreshing the page" })] }) }));
    }
    if (!sortedProjects.length) {
        return (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No projects found. Create your first project to get started!" }));
    }
    return (_jsxs("div", { className: "h-full overflow-hidden flex flex-col", children: [_jsx("div", { className: "flex-none px-10 pt-6", children: _jsx(PageHeader, { title: "Videos", className: "text-2xl font-bold tracking-tight" }) }), _jsx("div", { className: "flex-1 overflow-auto px-10 py-6", children: _jsx("div", { className: "space-y-8", children: sortedProjects.map((project) => (_jsx(ProjectCard, { project: project, onSelect: handleProjectSelect }, project.id))) }) })] }));
}
export function VideosPage() {
    return (_jsx(Suspense, { fallback: _jsx(LoadingState, {}), children: _jsx(PageContent, {}) }));
}
