import { cn } from '@/lib/utils';
import type { Project, ProjectListItem } from '@/types/project';
import { VideoList } from '@/components/video/VideoList';

interface ProjectCardProps {
  project: Project | ProjectListItem;
  onSelect?: (projectId: string) => void;
  className?: string;
}

export function ProjectCard({ project, onSelect, className }: ProjectCardProps) {
  const handleClick = () => {
    onSelect?.(project.id);
  };

  // Convert ProjectListItem videos to generations format if needed
  const generations =
    'generations' in project
      ? project.generations
      : project.videos.map((video) => ({
          id: video.id,
          videoUrl: video.url,
          status: 'completed' as const,
          prompt: project.prompt,
          createdAt: new Date().toISOString(),
          metadata: {},
        }));

  return (
    <div className={cn('overflow-hidden border-0 bg-transparent', className)}>
      <div className="p-0">
        <div className="flex gap-5">
          {/* Clickable Image */}
          <div className="w-[300px] shrink-0 cursor-pointer group relative" onClick={handleClick}>
            <div className="aspect-video">
              <img
                src={project.imageUrl}
                alt={project.prompt}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.prompt}</p>
          </div>

          {/* Video List */}
          <div className="flex-1">
            <div className="flex gap-5">
              <VideoList generations={generations} layout="grid" mode="edit" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
