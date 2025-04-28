/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import type { ApiResponse, ApiError } from '@/core/types/api';
import { ImageMapper } from './mapper';
import type { ImageUploadResult, UploadStatusResponse, ImageUploadOptions } from './types';
import { supabase } from '@/lib/supabase/client';
import { config } from '@/config/env';

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class ImageService extends BaseService {
  private static instance: ImageService;

  private constructor() {
    super();
    this.log('constructor', 'ImageService initialized');
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Validates a file before upload
   * @param file The file to validate
   * @returns An error message if validation fails, null if validation passes
   */
  private validateFile(file: File): string | null {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`;
    }

    return null;
  }

  /**
   * Simple, direct image upload implementation
   * This is a back-to-basics approach focusing on reliability
   */
  async uploadImage(
    file: File,
    options: ImageUploadOptions = {},
  ): Promise<ServiceResult<ImageUploadResult>> {
    this.log('uploadImage', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString(),
      projectId: options.projectId || 'default',
    });

    // Validate file before upload
    const validationError = this.validateFile(file);
    if (validationError) {
      this.log('uploadImage validation error', { error: validationError }, 'error');
      return {
        data: null,
        error: new Error(validationError),
      };
    }

    try {
      // Get the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Create a simple FormData object
      const formData = new FormData();

      // Add the file with field name 'image'
      formData.append('image', file);

      // Add project ID
      formData.append('projectId', options.projectId || 'default');

      // Add metadata if provided
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      this.log('uploadImage preparing request', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasProjectId: true,
        hasMetadata: !!options.metadata,
        approach: 'simple-direct',
      });

      // Set up the endpoint
      const endpoint = '/api/images/upload';
      const url = `${config.apiUrl}${endpoint}`;

      // Track upload progress if callback provided
      const onUploadProgress = options.onProgress
        ? (event: ProgressEvent) => {
            if (event.lengthComputable) {
              options.onProgress?.({
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              });
            }
          }
        : undefined;

      // Use the API client directly with FormData
      // This leverages your existing architecture while ensuring consistent handling
      const requestOptions: {
        onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
        timeout?: number;
        headers?: Record<string, string>;
        signal?: AbortSignal;
      } = {
        timeout: options.timeout || DEFAULT_TIMEOUT,
      };
      
      // Add progress callback if provided
      if (options.onProgress) {
        requestOptions.onProgress = (progress: { loaded: number; total: number; percentage: number }) => {
          options.onProgress?.(progress);
        };
      }

      // Add headers with authorization token
      requestOptions.headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await this.api.post(endpoint, formData, requestOptions);

      // Extract the response data for logging
      const responseData = this.isApiError(response)
        ? null
        : (response as ApiResponse<unknown>).data;
      const imageData =
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData &&
        responseData.data
          ? responseData.data
          : responseData;

      this.log('uploadImage response received', {
        isError: this.isApiError(response),
        status: response.status,
        timestamp: new Date().toISOString(),
        // Include the important data from the response
        imageUrl:
          imageData && typeof imageData === 'object'
            ? 'imageUrl' in imageData
              ? imageData.imageUrl
              : 'image_url' in imageData
                ? imageData.image_url
                : undefined
            : undefined,
        projectId:
          imageData && typeof imageData === 'object'
            ? 'projectId' in imageData
              ? imageData.projectId
              : 'project_id' in imageData
                ? imageData.project_id
                : undefined
            : undefined,
      });

      if (this.isApiError(response)) {
        throw ImageMapper.toError(response);
      }

      const apiResponse = response as ApiResponse<unknown>;
      return {
        data: ImageMapper.toUploadResult(apiResponse.data),
        error: null,
      };
    } catch (error) {
      this.log(
        'uploadImage error',
        {
          error,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        },
        'error',
      );

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to upload image'),
      };
    }
  }

  async checkUploadStatus(imageId: string): Promise<ServiceResult<UploadStatusResponse>> {
    this.log('checkUploadStatus', { imageId });

    try {
      const response = await this.api.get(`/api/images/${imageId}/status`);

      if (this.isApiError(response)) {
        throw ImageMapper.toError(response);
      }

      const apiResponse = response as ApiResponse<unknown>;
      return {
        data: ImageMapper.toStatusResponse(apiResponse.data),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to check upload status'),
      };
    }
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();
