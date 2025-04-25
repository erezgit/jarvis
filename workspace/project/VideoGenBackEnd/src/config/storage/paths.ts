/**
 * Storage path configuration and utilities
 */
export const PATH_CONFIG = {
  images: {
    project: (userId: string, projectId: string, fileName: string) =>
      `${userId}/${projectId}/${fileName}`,
    profile: (userId: string, fileName: string) =>
      `${userId}/profile/${fileName}`
  },
  videos: {
    project: (userId: string, projectId: string, fileName: string) =>
      `${userId}/${projectId}/${fileName}`,
    generation: (userId: string, generationId: string, fileName: string) =>
      `${userId}/${generationId}/${fileName}`
  }
} as const;

/**
 * Type for path types
 */
export type PathType = keyof typeof PATH_CONFIG;

/**
 * Validate a storage path
 */
export function validatePath(path: string): boolean {
  const parts = path.split('/');
  return parts.length === 3 && parts.every(Boolean);
}

/**
 * Extract user ID from path
 */
export function getUserIdFromPath(path: string): string | null {
  const parts = path.split('/');
  return parts.length >= 1 ? parts[0] : null;
}

/**
 * Extract project ID from path
 */
export function getProjectIdFromPath(path: string): string | null {
  const parts = path.split('/');
  return parts.length >= 2 ? parts[1] : null;
} 