export class ProjectMapper {
    static toProject(data) {
        return {
            id: data.id,
            name: data.title || '',
            description: data.description,
            imageUrl: data.imageUrl,
            prompt: data.prompt,
            status: data.status || 'draft',
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
            generations: data.generations?.map(ProjectMapper.toGeneration) || [],
            videoIds: data.videoIds || data.video_ids || [],
            videos: data.generations?.map(ProjectMapper.generationToVideo) || undefined,
        };
    }
    static toProjectList(data) {
        return {
            id: data.id,
            name: data.title || '',
            imageUrl: data.imageUrl,
            prompt: data.prompt || '',
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            videoCount: data.generations?.length || 0,
            videos: data.generations?.map(ProjectMapper.generationToVideo) || undefined,
        };
    }
    static toGeneration(data) {
        return {
            id: data.id,
            videoUrl: data.video_url || data.videoUrl || null,
            status: data.status || 'queued',
            prompt: data.prompt || '',
            createdAt: data.created_at || new Date().toISOString(),
            metadata: {
                thumbnailUrl: data.thumbnail_url,
                duration: data.duration,
                error: data.error,
            },
        };
    }
    static generationToVideo(generation) {
        console.log('[ProjectMapper] Converting generation to video:', {
            id: generation.id,
            video_url: generation.video_url,
            videoUrl: generation.videoUrl,
            status: generation.status
        });
        const videoUrl = generation.video_url || generation.videoUrl || null;
        let status = generation.status || 'queued';
        if (status === 'pending') {
            status = 'queued';
        }
        return {
            id: generation.id,
            url: videoUrl,
            status: status,
            prompt: generation.prompt || '',
            createdAt: generation.created_at || new Date().toISOString(),
            metadata: {
                thumbnailUrl: generation.thumbnail_url,
                duration: generation.duration,
                error: generation.error,
            },
        };
    }
    static toVideo(data) {
        const videoUrl = data.url || data.video_url || data.videoUrl || null;
        let status = data.status || 'queued';
        if (status === 'pending') {
            status = 'queued';
        }
        return {
            id: data.id,
            url: videoUrl,
            status: status,
            prompt: data.prompt || '',
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            metadata: data.metadata,
        };
    }
}
