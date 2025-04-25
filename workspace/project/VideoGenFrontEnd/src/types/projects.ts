import type { ApiResponse } from './api';

export interface ProjectVideo {
  id: string;
  url: string;
}

export interface ProjectListItem {
  id: string;
  imageUrl: string;
  prompt: string;
  videos: ProjectVideo[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
}

export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export type ProjectResponse = ApiResponse<Project>;
export type ProjectListResponse = ApiResponse<Project[]>;

export interface ProjectError extends Error {
  code: ProjectErrorCode;
}

export type ProjectErrorCode =
  | 'PROJECT_NOT_FOUND'
  | 'PROJECT_CREATION_FAILED'
  | 'PROJECT_UPDATE_FAILED'
  | 'PROJECT_DELETE_FAILED'
  | 'INVALID_PROJECT_DATA'
  | 'UNAUTHORIZED_ACCESS';

export function isProjectError(error: unknown): error is ProjectError {
  return error instanceof Error && 'code' in error;
}
