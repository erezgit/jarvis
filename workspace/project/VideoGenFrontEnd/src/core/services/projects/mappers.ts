import type {
  Project,
  ProjectListItem,
  Generation,
  ProjectStatus,
  GenerationStatus,
} from './types';
import type { Video, VideoStatus } from '@/core/services/videos';

// Define interfaces for raw API response data
interface RawProjectData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  prompt?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  generations?: RawGenerationData[];
  videoIds?: string[];
  video_ids?: string[];
}

interface RawGenerationData {
  id: string;
  video_url?: string;
  videoUrl?: string;
  status?: string;
  prompt?: string;
  created_at?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

interface RawVideoData {
  id: string;
  url?: string;
  video_url?: string;
  videoUrl?: string;
  status?: string;
  prompt?: string;
  createdAt?: string;
  created_at?: string;
  metadata?: {
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
    [key: string]: unknown;
  };
}

export class ProjectMapper {
  static toProject(data: RawProjectData): Project {
    return {
      id: data.id,
      name: data.title || '',
      description: data.description,
      imageUrl: data.imageUrl,
      prompt: data.prompt,
      status: (data.status as ProjectStatus) || 'draft',
      createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
      generations: data.generations?.map(ProjectMapper.toGeneration) || [],
      videoIds: data.videoIds || data.video_ids || [],
      videos: data.generations?.map(ProjectMapper.generationToVideo) || undefined,
    };
  }

  static toProjectList(data: RawProjectData): ProjectListItem {
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

  static toGeneration(data: RawGenerationData): Generation {
    return {
      id: data.id,
      videoUrl: data.video_url || data.videoUrl || null,
      status: (data.status as GenerationStatus) || 'queued',
      prompt: data.prompt || '',
      createdAt: data.created_at || new Date().toISOString(),
      metadata: {
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
      },
    };
  }

  static generationToVideo(generation: RawGenerationData): Video {
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
      status: status as VideoStatus,
      prompt: generation.prompt || '',
      createdAt: generation.created_at || new Date().toISOString(),
      metadata: {
        thumbnailUrl: generation.thumbnail_url,
        duration: generation.duration,
        error: generation.error,
      },
    };
  }

  static toVideo(data: RawVideoData): Video {
    const videoUrl = data.url || data.video_url || data.videoUrl || null;
    
    let status = data.status || 'queued';
    if (status === 'pending') {
      status = 'queued';
    }
    
    return {
      id: data.id,
      url: videoUrl,
      status: status as VideoStatus,
      prompt: data.prompt || '',
      createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      metadata: data.metadata,
    };
  }
}
