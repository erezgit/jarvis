import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/core/hooks/projects';
import { ProjectCard } from '@/components/video/ProjectCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { Spinner } from '@/components/common/Spinner';
import type { ProjectListItem } from '@/core/services/projects';

function LoadingState() {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-none px-10 pt-6">
        <PageHeader title="Videos" className="text-2xl font-bold tracking-tight" />
      </div>
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" />
      </div>
    </div>
  );
}

function PageContent() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      navigate(`/videos/new/${projectId}`);
    },
    [navigate],
  );

  // Sort projects by creation date (newest first)
  const sortedProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    return [...projects].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [projects]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message}
          <button
            onClick={() => window.location.reload()}
            className="block w-full mt-2 text-sm underline hover:no-underline"
          >
            Try refreshing the page
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!sortedProjects.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No projects found. Create your first project to get started!
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-none px-10 pt-6">
        <PageHeader title="Videos" className="text-2xl font-bold tracking-tight" />
      </div>
      <div className="flex-1 overflow-auto px-10 py-6">
        <div className="space-y-8">
          {sortedProjects.map((project: ProjectListItem) => (
            <ProjectCard key={project.id} project={project} onSelect={handleProjectSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function VideosPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PageContent />
    </Suspense>
  );
}
