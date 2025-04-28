import { getUnifiedApiClient } from '@/core/services/api/factory';
import type { ApiResponse, ApiError } from '@/core/types/api';

/**
 * API Client Adapter
 * 
 * This adapter provides the same interface as the old API client
 * but uses the new unified client internally.
 * 
 * This allows for a gradual migration without breaking existing code.
 */
class ApiClientAdapter {
  private unifiedClient = getUnifiedApiClient();

  /**
   * Performs a GET request
   * @param endpoint API endpoint path
   * @returns API response or error
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    // Remove /api/ prefix if present
    const normalizedEndpoint = endpoint.startsWith('/api/') 
      ? endpoint.substring(5) // Remove '/api/' (5 characters)
      : endpoint.startsWith('/') 
        ? endpoint.substring(1) // Remove leading slash
        : endpoint;
    
    console.log(`[ApiClientAdapter] GET request: ${endpoint} → ${normalizedEndpoint}`);
    return this.unifiedClient.get<T>(normalizedEndpoint);
  }

  /**
   * Performs a POST request
   * @param endpoint API endpoint path
   * @param body Request body
   * @returns API response or error
   */
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T> | ApiError> {
    // Remove /api/ prefix if present
    const normalizedEndpoint = endpoint.startsWith('/api/') 
      ? endpoint.substring(5) // Remove '/api/' (5 characters)
      : endpoint.startsWith('/') 
        ? endpoint.substring(1) // Remove leading slash
        : endpoint;
    
    console.log(`[ApiClientAdapter] POST request: ${endpoint} → ${normalizedEndpoint}`);
    return this.unifiedClient.post<T>(normalizedEndpoint, body);
  }

  /**
   * Performs a PUT request
   * @param endpoint API endpoint path
   * @param body Request body
   * @returns API response or error
   */
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T> | ApiError> {
    // Remove /api/ prefix if present
    const normalizedEndpoint = endpoint.startsWith('/api/') 
      ? endpoint.substring(5) // Remove '/api/' (5 characters)
      : endpoint.startsWith('/') 
        ? endpoint.substring(1) // Remove leading slash
        : endpoint;
    
    console.log(`[ApiClientAdapter] PUT request: ${endpoint} → ${normalizedEndpoint}`);
    return this.unifiedClient.put<T>(normalizedEndpoint, body);
  }

  /**
   * Performs a DELETE request
   * @param endpoint API endpoint path
   * @returns API response or error
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    // Remove /api/ prefix if present
    const normalizedEndpoint = endpoint.startsWith('/api/') 
      ? endpoint.substring(5) // Remove '/api/' (5 characters)
      : endpoint.startsWith('/') 
        ? endpoint.substring(1) // Remove leading slash
        : endpoint;
    
    console.log(`[ApiClientAdapter] DELETE request: ${endpoint} → ${normalizedEndpoint}`);
    return this.unifiedClient.delete<T>(normalizedEndpoint);
  }

  /**
   * Sets the authentication token
   * @param token Authentication token
   * @deprecated No longer needed with the unified client
   */
  setToken(token: string | null): void {
    console.warn('[ApiClientAdapter] setToken is deprecated and has no effect with the unified client');
    // No-op - token handling is done by the unified client
  }
}

// Export a singleton instance
export const apiAdapter = new ApiClientAdapter();

// Export the type guard for backward compatibility
export function isApiError(response: unknown): response is ApiError {
  return (
    Boolean(response) &&
    typeof (response as ApiError).message === 'string' &&
    typeof (response as ApiError).status === 'number'
  );
} 