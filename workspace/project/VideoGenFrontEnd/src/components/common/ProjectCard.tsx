import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ProjectListItem } from '@/types/projects';

interface ProjectCardProps {
  project: ProjectListItem;
  loading?: boolean;
  error?: string | null;
}

export function ProjectCard({ project, loading = false, error = null }: ProjectCardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.prompt}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={project.imageUrl}
          alt={project.prompt}
          className="w-full h-[200px] object-cover rounded-md mb-4"
        />
        <div className="space-y-4">
          {project.videos.map((video) => (
            <video key={video.id} src={video.url} controls className="w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
