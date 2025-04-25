import { UnifiedApiClient } from '../api/unified-client';
import type { ApiResponse, ApiError } from '@/core/types/api';

/**
 * API Client Adapter
 * 
 * This adapter wraps the UnifiedApiClient to match the BaseService's API interface.
 * It solves the issue of PaymentService trying to override the read-only api property
 * by providing a compatible interface that can be used with the BaseService methods.
 */
export class ApiClientAdapter {
  private client: UnifiedApiClient;

  constructor(client: UnifiedApiClient) {
    this.client = client;
  }

  /**
   * Perform a GET request
   * @param url The URL to request
   * @returns The response data
   */
  async get<T>(url: string): Promise<ApiResponse<T> | ApiError> {
    return this.client.get<T>(url);
  }

  /**
   * Perform a POST request
   * @param url The URL to request
   * @param data The data to send
   * @returns The response data
   */
  async post<T>(url: string, data: unknown): Promise<ApiResponse<T> | ApiError> {
    return this.client.post<T>(url, data);
  }

  /**
   * Perform a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @returns The response data
   */
  async put<T>(url: string, data: unknown): Promise<ApiResponse<T> | ApiError> {
    return this.client.put<T>(url, data);
  }

  /**
   * Perform a DELETE request
   * @param url The URL to request
   * @returns The response data
   */
  async delete<T>(url: string): Promise<ApiResponse<T> | ApiError> {
    return this.client.delete<T>(url);
  }
} 