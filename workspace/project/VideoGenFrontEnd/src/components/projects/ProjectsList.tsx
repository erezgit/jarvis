import type { ProjectListItem } from '@/types/projects';
import { cn } from '@/lib/utils';

interface ProjectsListProps {
  projects: ProjectListItem[];
  className?: string;
}

export function ProjectsList({ projects, className }: ProjectsListProps) {
  if (projects.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No projects found</div>;
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="aspect-video relative">
            <img
              src={project.imageUrl}
              alt={project.prompt}
              className="object-cover rounded-t-lg w-full h-full"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{project.prompt}</p>
            <div className="mt-4">
              {project.videos.length > 0 ? (
                <div className="grid gap-2">
                  {project.videos.map((video) => (
                    <video key={video.id} src={video.url} controls className="w-full rounded" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No videos generated yet</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
