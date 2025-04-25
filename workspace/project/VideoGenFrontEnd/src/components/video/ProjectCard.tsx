import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { VideoList } from './VideoList';
import type { Project, ProjectListItem } from '@/core/services/projects';
import { VideoCard } from './VideoCard';
import { PlayCircle } from 'lucide-react';

interface ProjectCardProps {
  project: Project | ProjectListItem;
  onSelect?: (projectId: string) => void;
  className?: string;
  showLoadingSpinner?: boolean;
}

export function ProjectCard({ project, onSelect, className, showLoadingSpinner = false }: ProjectCardProps) {
  const handleClick = () => {
    onSelect?.(project.id);
  };

  // Format the date to a simplified version
  const formatDate = (dateString: string) => {
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

  return (
    <Card className={cn('overflow-hidden border-0 bg-transparent', className)}>
      <CardContent className="p-0">
        <div className="flex gap-4">
          {/* Project Image */}
          <div className="w-[300px] shrink-0 cursor-pointer" onClick={handleClick}>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.prompt || 'Project image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">No image available</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatDate(project.createdAt)}</p>
          </div>

          {/* Videos */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-5">
              {sortedVideos.length > 0 ? (
                sortedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={{
                      ...video,
                      prompt: project.prompt,
                      status: video.status || 'completed',
                    }}
                    responsive={false}
                    showLoadingSpinner={showLoadingSpinner}
                  />
                ))
              ) : (
                <div
                  className="flex flex-col items-center justify-center bg-muted rounded-lg max-w-[300px] w-full aspect-video"
                >
                  <PlayCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No videos generated yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
