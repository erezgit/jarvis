/**
 * Test script for API URL construction
 * This script can be used to verify that API URLs are being constructed correctly
 * 
 * Usage:
 * 1. Import this script in a component or page
 * 2. Call the testApiUrl function
 * 3. Check the console for detailed logs
 */

import { config } from '@/config/env';
import { 
  constructApiUrl, 
  removeDuplicateSlashes, 
  hasDuplicateApiPath,
  removeDuplicateApiPath 
} from '@/utils/url';

/**
 * Tests API URL construction with various endpoints
 */
export function testApiUrl(): void {
  console.group('=== API URL CONSTRUCTION TEST ===');
  
  // Log environment configuration
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.apiBaseUrl);
  console.log('API Path:', config.apiPath);
  console.log('Legacy API URL:', config.apiUrl);
  
  // Test endpoints
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
  
  // Test URL construction
  console.group('URL Construction Tests');
  testEndpoints.forEach(endpoint => {
    console.group(`Endpoint: "${endpoint}"`);
    
    // Test constructApiUrl
    const constructedUrl = constructApiUrl(config.apiBaseUrl, config.apiPath, endpoint);
    console.log('Constructed URL:', constructedUrl);
    
    // Test removeDuplicateSlashes
    const cleanUrl = removeDuplicateSlashes(constructedUrl);
    console.log('Clean URL (no duplicate slashes):', cleanUrl);
    
    // Test hasDuplicateApiPath
    const hasDuplicates = hasDuplicateApiPath(constructedUrl, config.apiPath);
    console.log('Has duplicate API path:', hasDuplicates);
    
    // Test removeDuplicateApiPath
    if (hasDuplicates) {
      const fixedUrl = removeDuplicateApiPath(constructedUrl, config.apiPath);
      console.log('Fixed URL (no duplicate API path):', fixedUrl);
    }
    
    console.groupEnd();
  });
  console.groupEnd();
  
  console.groupEnd();
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  testApiUrl();
} 