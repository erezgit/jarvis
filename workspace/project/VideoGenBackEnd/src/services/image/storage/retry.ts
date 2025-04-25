import { Logger } from 'winston';
import { StorageTimeoutError } from './errors';

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  timeout: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
  timeout: 30000
};

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  logger: Logger,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let delay = retryConfig.initialDelayMs;

  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Create a promise that rejects on timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new StorageTimeoutError(operationName, retryConfig.timeout));
        }, retryConfig.timeout);
      });

      // Race between the operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      if (attempt > 1) {
        logger.info(`Operation '${operationName}' succeeded after ${attempt} attempts`, {
          attempt,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === retryConfig.maxRetries) {
        logger.error(`Operation '${operationName}' failed after ${attempt} attempts`, {
          error: lastError.message,
          attempts: attempt,
          timestamp: new Date().toISOString()
        });
        throw lastError;
      }

      logger.warn(`Operation '${operationName}' failed, retrying...`, {
        error: lastError.message,
        attempt,
        nextDelay: delay,
        timestamp: new Date().toISOString()
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * retryConfig.backoffFactor, retryConfig.maxDelayMs);
    }
  }

  // This should never happen due to the throw in the loop
  throw lastError || new Error(`Operation '${operationName}' failed`);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.message.includes('network') || error.message.includes('connection')) {
    return true;
  }

  // Timeout errors
  if (error instanceof StorageTimeoutError || error.message.includes('timeout')) {
    return true;
  }

  // Rate limiting or server errors
  if (error.message.includes('429') || error.message.includes('503')) {
    return true;
  }

  // Quota errors should not be retried
  if (error.message.includes('quota') || error.message.includes('storage full')) {
    return false;
  }

  // Permission errors should not be retried
  if (error.message.includes('permission') || error.message.includes('unauthorized')) {
    return false;
  }

  return false;
} 