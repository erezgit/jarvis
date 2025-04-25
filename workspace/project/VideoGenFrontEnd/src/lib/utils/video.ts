import type { Project, ProjectListItem, Generation } from '@/types/project';

export function convertToGenerations(
  project: Project | ProjectListItem | null | undefined,
): Generation[] {
  if (!project) return [];

  // If project has generations array, use it directly
  if ('generations' in project && Array.isArray(project.generations)) {
    return project.generations;
  }

  // If project has videos array, convert to generations format
  if ('videos' in project && Array.isArray(project.videos)) {
    return project.videos
      .filter(
        (video): video is { id: string; url: string } => video.id !== null && video.url !== null,
      )
      .map((video) => ({
        id: video.id,
        videoUrl: video.url,
        status: 'completed' as const,
        prompt: project.prompt || '',
        createdAt: new Date().toISOString(),
        metadata: {
          duration: 0,
          thumbnailUrl: undefined,
        },
      }));
  }

  return [];
}
