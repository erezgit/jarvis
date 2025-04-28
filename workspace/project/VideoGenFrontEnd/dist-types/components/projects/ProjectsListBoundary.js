import { jsx as _jsx } from "react/jsx-runtime";
import { QueryBoundary } from '@/components/common/QueryBoundary';
import { useProjects } from '@/hooks/useProjects';
import { ProjectsList } from './ProjectsList';
import { ProjectsListSkeleton } from './ProjectsListSkeleton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
export function ProjectsListBoundary() {
    const query = useProjects();
    return (_jsx(QueryBoundary, { query: query, fallback: _jsx(ProjectsListSkeleton, {}), error: _jsx(ErrorDisplay, { message: "Failed to load projects" }), children: (data) => _jsx(ProjectsList, { projects: data.projects }) }));
}
