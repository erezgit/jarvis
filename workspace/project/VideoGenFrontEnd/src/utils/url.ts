/**
 * URL utility functions for consistent path handling
 */

/**
 * Normalizes a URL path by removing leading and trailing slashes
 * @param path The path to normalize
 * @returns Normalized path without leading or trailing slashes
 */
export function normalizePath(path: string): string {
  // Return empty string for null/undefined/empty paths
  if (!path) return '';
  
  // Remove leading and trailing slashes
  let normalized = path.trim();
  
  // Remove leading slash if present
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  // Remove trailing slash if present
  if (normalized.endsWith('/')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  
  return normalized;
}

/**
 * Joins multiple URL path segments, handling slashes correctly
 * @param parts Path segments to join
 * @returns Joined path with proper slash handling
 */
export function joinPaths(...parts: string[]): string {
  return parts
    .map(part => part?.trim() || '')
    .filter(Boolean)
    .map(part => normalizePath(part))
    .join('/');
}

/**
 * Constructs a full API URL from base URL, API path, and endpoint
 * @param baseUrl Base URL (e.g., 'https://example.com')
 * @param apiPath API path (e.g., 'api')
 * @param endpoint Endpoint path (e.g., 'projects')
 * @returns Full API URL with proper path handling
 */
export function constructApiUrl(baseUrl: string, apiPath: string, endpoint: string): string {
  const normalizedBase = normalizePath(baseUrl);
  const joined = joinPaths(apiPath, endpoint);
  
  return joined ? `${normalizedBase}/${joined}` : normalizedBase;
}

/**
 * Checks if a URL has a specific path segment
 * @param url The URL to check
 * @param segment The path segment to look for
 * @returns True if the URL contains the path segment
 */
export function hasPathSegment(url: string, segment: string): boolean {
  if (!url || !segment) return false;
  
  const normalizedSegment = normalizePath(segment);
  const urlParts = url.split('/').map(part => normalizePath(part)).filter(Boolean);
  
  return urlParts.includes(normalizedSegment);
}

/**
 * Removes duplicate slashes from a URL path
 * @param url The URL to clean
 * @returns URL with duplicate slashes removed
 */
export function removeDuplicateSlashes(url: string): string {
  if (!url) return '';
  
  // Replace multiple slashes with a single slash, but preserve protocol slashes
  return url.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Checks if a URL has duplicate API path segments
 * @param url The URL to check
 * @param apiPath The API path segment to check for duplicates
 * @returns True if the URL has duplicate API path segments
 */
export function hasDuplicateApiPath(url: string, apiPath: string = 'api'): boolean {
  if (!url || !apiPath) return false;
  
  const normalizedApiPath = normalizePath(apiPath);
  const urlParts = url.split('/').map(part => normalizePath(part)).filter(Boolean);
  
  // Count occurrences of the API path segment
  const occurrences = urlParts.filter(part => part === normalizedApiPath).length;
  
  return occurrences > 1;
}

/**
 * Removes duplicate API path segments from a URL
 * @param url The URL to clean
 * @param apiPath The API path segment to check for duplicates
 * @returns URL with duplicate API path segments removed
 */
export function removeDuplicateApiPath(url: string, apiPath: string = 'api'): string {
  if (!url || !apiPath) return url || '';
  
  const normalizedApiPath = normalizePath(apiPath);
  
  // Split the URL into parts
  const urlParts = url.split('/');
  
  // Find all occurrences of the API path segment
  const occurrences: number[] = [];
  urlParts.forEach((part, index) => {
    if (normalizePath(part) === normalizedApiPath) {
      occurrences.push(index);
    }
  });
  
  // If there are multiple occurrences, remove all but the first one
  if (occurrences.length > 1) {
    // Remove from the end to avoid index shifting
    for (let i = occurrences.length - 1; i > 0; i--) {
      urlParts.splice(occurrences[i], 1);
    }
  }
  
  return urlParts.join('/');
} 