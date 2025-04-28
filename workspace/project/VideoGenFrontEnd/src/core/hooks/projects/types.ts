import type { ProjectStatus } from '@/core/services/projects';

/**
 * View model for project data
 * Represents the transformed project data used in the UI
 */
export interface ProjectViewModel {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  status: ProjectStatus;
  videoCount: number;
  lastUpdated: string;
}
