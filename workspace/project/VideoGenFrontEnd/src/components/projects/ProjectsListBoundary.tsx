import { QueryBoundary } from '@/components/common/QueryBoundary';
import { useProjects } from '@/hooks/useProjects';
import { ProjectsList } from './ProjectsList';
import { ProjectsListSkeleton } from './ProjectsListSkeleton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';

interface ProjectsData {
  projects: Array<{
    id: string;
    prompt: string;
    imageUrl: string;
    videos: Array<{
      id: string;
      url: string;
    }>;
  }>;
  total: number;
}

export function ProjectsListBoundary() {
  const query = useProjects();

  return (
    <QueryBoundary<ProjectsData>
      query={query}
      fallback={<ProjectsListSkeleton />}
      error={<ErrorDisplay message="Failed to load projects" />}
    >
      {(data) => <ProjectsList projects={data.projects} />}
    </QueryBoundary>
  );
}
