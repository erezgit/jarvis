/**
 * Represents the status of a video generation process
 */
export type GenerationStatus =
  | 'queued' // Initial state when generation is requested
  | 'preparing' // Setting up generation resources
  | 'generating' // Active generation process
  | 'processing' // Post-generation processing
  | 'completed' // Successfully completed
  | 'failed'; // Generation failed

/**
 * Metadata associated with a video generation
 */
export interface GenerationMetadata {
  thumbnailUrl?: string; // URL to video thumbnail
  duration?: number; // Video duration in seconds
  error?: string; // Error message if generation failed
}

/**
 * Represents a single video generation attempt
 */
export interface Generation {
  id: string;
  videoUrl: string | null;
  status: GenerationStatus;
  prompt: string;
  createdAt: string;
  metadata: GenerationMetadata;
}

/**
 * Represents a project that can contain multiple video generations
 */
export interface Project {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  generations: Generation[];
}

/**
 * API response format for project queries
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Represents a project in the list view
 */
export interface ProjectListItem extends Pick<Project, 'id' | 'imageUrl' | 'prompt'> {
  videos: Array<{
    id: string;
    url: string | null;
  }>;
}
