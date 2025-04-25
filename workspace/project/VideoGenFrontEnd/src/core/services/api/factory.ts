import { config } from '@/config/env';
import { ApiClient } from './client';
import { UnifiedApiClient } from './unified-client';

// Legacy API client instance (kept for backward compatibility)
let apiClientInstance: ApiClient | null = null;

// New unified API client instance
let unifiedApiClientInstance: UnifiedApiClient | null = null;

/**
 * Gets the legacy API client instance
 * @deprecated Use getUnifiedApiClient instead
 * @returns Legacy API client instance
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    console.log('Creating legacy API client instance', { apiUrl: config.apiUrl });
    apiClientInstance = new ApiClient({
      baseUrl: config.apiUrl,
    });
  }

  return apiClientInstance;
}

/**
 * Gets the unified API client instance
 * This is the preferred way to get an API client
 * @returns Unified API client instance
 */
export function getUnifiedApiClient(): UnifiedApiClient {
  if (!unifiedApiClientInstance) {
    console.log('Creating unified API client instance', { 
      baseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
      environment: config.environment,
      fullApiUrl: `${config.apiBaseUrl}/${config.apiPath}`.replace(/([^:]\/)\/+/g, '$1'),
      legacyApiUrl: config.apiUrl
    });
    
    unifiedApiClientInstance = new UnifiedApiClient({
      baseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
      debug: true, // Enable debug logging for all environments temporarily
    });
  }

  return unifiedApiClientInstance;
}

/**
 * Resets all API client instances
 * Useful for testing or when configuration changes
 */
export function resetApiClients(): void {
  apiClientInstance = null;
  unifiedApiClientInstance = null;
}
