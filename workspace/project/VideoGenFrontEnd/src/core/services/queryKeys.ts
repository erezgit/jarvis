/**
 * Query Key Constants
 *
 * This file contains constants for all React Query keys used in the application.
 * Using these constants ensures consistency across the application and makes it
 * easier to refactor and maintain query invalidation logic.
 */

/**
 * Project-related query keys
 */
export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all] as const,
  detail: (projectId: string) => ['project', projectId] as const,
  videos: (projectId: string) => ['project-videos', projectId] as const,
};

/**
 * Video-related query keys
 */
export const VIDEO_KEYS = {
  all: ['videos'] as const,
  lists: () => [...VIDEO_KEYS.all] as const,
  detail: (videoId: string) => ['video', videoId] as const,
  generation: {
    status: (projectId: string, generationId: string) =>
      ['generation-status', projectId, generationId] as const,
    progress: (generationId: string) => ['generation-progress', generationId] as const,
  },
};

/**
 * Prompt-related query keys
 */
export const PROMPT_KEYS = {
  categories: () => ['prompt-categories'] as const,
  options: (categoryId: string) => ['prompt-options', categoryId] as const,
};

/**
 * Discovery-related query keys
 */
export const DISCOVERY_KEYS = {
  all: ['discoveries'] as const,
  lists: () => [...DISCOVERY_KEYS.all] as const,
  availableVideos: () => ['discoveries', 'available'] as const,
  detail: (id: string) => ['discoveries', id] as const,
};

/**
 * Combined query keys object for easy import
 */
export const QUERY_KEYS = {
  PROJECT: PROJECT_KEYS,
  VIDEO: VIDEO_KEYS,
  PROMPT: PROMPT_KEYS,
  DISCOVERY: DISCOVERY_KEYS,
};

export default QUERY_KEYS;
