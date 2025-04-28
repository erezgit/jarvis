import type { ApiErrorCode } from '@/core/services/api/errors';

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  code: ApiErrorCode;
  message: string;
  retryAfter?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.status === 'error';
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.status === 'success';
}

export interface IImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface IImageUploadError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface IImageUploadResponse {
  success: boolean;
  projectId?: string;
  imageUrl?: string;
  error?: string;
}
