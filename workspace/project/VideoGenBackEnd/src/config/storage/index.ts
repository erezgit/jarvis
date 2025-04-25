export * from './buckets';
export * from './paths';

/**
 * Combined storage configuration
 */
export const STORAGE_CONFIG = {
  buckets: require('./buckets').BUCKET_CONFIG,
  paths: require('./paths').PATH_CONFIG,
  validation: {
    validatePath: require('./paths').validatePath
  }
} as const; 