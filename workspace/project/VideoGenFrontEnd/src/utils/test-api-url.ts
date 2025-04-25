import { config } from '@/config/env';
import { constructApiUrl, removeDuplicateSlashes } from '@/utils/url';
import { getUnifiedApiClient } from '@/core/services/api/factory';

/**
 * Test utility to verify API URL construction
 * This can be used to check if URLs are being constructed correctly
 */
export function testApiUrlConstruction(): void {
  console.group('API URL Construction Test');
  
  // Test environment configuration
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.apiBaseUrl);
  console.log('API Path:', config.apiPath);
  console.log('Legacy API URL:', config.apiUrl);
  
  // Test URL construction utilities
  const testEndpoints = [
    'projects',
    '/projects',
    'projects/',
    '/projects/',
    'projects/123',
    '/projects/123',
    'projects?include=videos',
    '/projects?include=videos',
    'api/projects',
    '/api/projects',
    'api/projects/123',
    '/api/projects/123',
  ];
  
  console.group('URL Construction Tests');
  testEndpoints.forEach(endpoint => {
    const constructedUrl = constructApiUrl(config.apiBaseUrl, config.apiPath, endpoint);
    const cleanUrl = removeDuplicateSlashes(constructedUrl);
    console.log(`Endpoint: "${endpoint}" → "${cleanUrl}"`);
  });
  console.groupEnd();
  
  // Test the unified client URL construction
  const unifiedClient = getUnifiedApiClient();
  
  // Create a test request (won't actually be sent)
  console.group('Unified Client URL Tests');
  testEndpoints.forEach(endpoint => {
    try {
      // Use reflection to access the private method (for testing only)
      const getFullApiUrl = (unifiedClient as any).getFullApiUrl.bind(unifiedClient);
      const url = getFullApiUrl(endpoint);
      console.log(`Endpoint: "${endpoint}" → "${url}"`);
    } catch (error) {
      console.error('Failed to test unified client URL construction:', error);
    }
  });
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Logs a test request to the console without actually sending it
 * This can be used to verify that requests are being constructed correctly
 * @param method HTTP method
 * @param endpoint API endpoint
 * @param body Optional request body
 */
export function logTestRequest(method: string, endpoint: string, body?: unknown): void {
  const unifiedClient = getUnifiedApiClient();
  
  try {
    // Use reflection to access the private method (for testing only)
    const getFullApiUrl = (unifiedClient as any).getFullApiUrl.bind(unifiedClient);
    const url = getFullApiUrl(endpoint);
    
    console.group(`Test ${method} Request`);
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Endpoint:', endpoint);
    if (body) {
      console.log('Body:', body);
    }
    console.groupEnd();
  } catch (error) {
    console.error('Failed to log test request:', error);
  }
} 