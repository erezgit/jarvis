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
    all: ['projects'],
    lists: () => [...PROJECT_KEYS.all],
    detail: (projectId) => ['project', projectId],
    videos: (projectId) => ['project-videos', projectId],
};
/**
 * Video-related query keys
 */
export const VIDEO_KEYS = {
    all: ['videos'],
    lists: () => [...VIDEO_KEYS.all],
    detail: (videoId) => ['video', videoId],
    generation: {
        status: (projectId, generationId) => ['generation-status', projectId, generationId],
        progress: (generationId) => ['generation-progress', generationId],
    },
};
/**
 * Prompt-related query keys
 */
export const PROMPT_KEYS = {
    categories: () => ['prompt-categories'],
    options: (categoryId) => ['prompt-options', categoryId],
};
/**
 * Combined query keys object for easy import
 */
export const QUERY_KEYS = {
    PROJECT: PROJECT_KEYS,
    VIDEO: VIDEO_KEYS,
    PROMPT: PROMPT_KEYS,
};
export default QUERY_KEYS;
