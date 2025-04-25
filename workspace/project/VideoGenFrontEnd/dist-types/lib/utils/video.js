export function convertToGenerations(project) {
    if (!project)
        return [];
    // If project has generations array, use it directly
    if ('generations' in project && Array.isArray(project.generations)) {
        return project.generations;
    }
    // If project has videos array, convert to generations format
    if ('videos' in project && Array.isArray(project.videos)) {
        return project.videos
            .filter((video) => video.id !== null && video.url !== null)
            .map((video) => ({
            id: video.id,
            videoUrl: video.url,
            status: 'completed',
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
