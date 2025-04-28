import type { ApiError } from '@/core/types/api';
import type { ImageUploadResult, UploadStatusResponse } from './types';

export class ImageMapper {
  static toUploadResult(data: unknown): ImageUploadResult {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid upload result data');
    }

    // Define a more specific type for the result
    interface UploadResultData {
      data?: {
        imageUrl?: string;
        image_url?: string;
        projectId?: string;
        project_id?: string;
      };
      imageUrl?: string;
      image_url?: string;
      projectId?: string;
      project_id?: string;
    }

    const result = data as UploadResultData;

    // Handle the nested response structure
    // The backend returns: { success: true, data: { success: true, projectId: "...", imageUrl: "..." } }
    if (result.data && typeof result.data === 'object') {
      const innerData = result.data;
      return {
        imageUrl: innerData.imageUrl || innerData.image_url || '',
        projectId: innerData.projectId || innerData.project_id || '',
      };
    }

    // Fallback to the old structure for backward compatibility
    return {
      imageUrl: result.imageUrl || result.image_url || '',
      projectId: result.projectId || result.project_id || '',
    };
  }

  static toStatusResponse(data: unknown): UploadStatusResponse {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid status response data');
    }

    // Define a more specific type for the status
    interface StatusResponseData {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      imageUrl?: string;
      image_url?: string;
      error?: string;
    }

    const status = data as StatusResponseData;
    return {
      status: status.status,
      imageUrl: status.imageUrl || status.image_url,
      error: status.error,
    };
  }

  static toError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        status: 500,
      };
    }

    return {
      message: 'Unknown error occurred',
      status: 500,
    };
  }
}
