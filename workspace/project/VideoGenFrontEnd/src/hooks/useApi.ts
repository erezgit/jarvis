// Built-in modules
import { useState, useCallback, useRef, useEffect } from 'react';

// Internal modules
import { UseApiReturn } from '@/types/hooks';
import { createHookError, ERROR_MESSAGES } from '@/utils/error';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface RateLimit {
  count: number;
  resetTime: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT = 100; // requests
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function useApi<T>(url: string, options: RequestInit = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache management
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());

  // Rate limiting
  const rateLimit = useRef<RateLimit>({
    count: 0,
    resetTime: Date.now() + RATE_LIMIT_WINDOW,
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now > rateLimit.current.resetTime) {
      rateLimit.current = {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
    }

    if (rateLimit.current.count >= RATE_LIMIT) {
      throw createHookError('api', ERROR_MESSAGES.api.RATE_LIMIT);
    }

    rateLimit.current.count++;
  }, []);

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const fetchData = useCallback(async () => {
    const cacheKey = `${url}${JSON.stringify(options)}`;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Check rate limit
      checkRateLimit();

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw createHookError('api', ERROR_MESSAGES.api.REQUEST_FAILED);
      }

      const jsonData: T = await response.json();
      setData(jsonData);
      setCachedData(cacheKey, jsonData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [url, options, getCachedData, setCachedData, checkRateLimit]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
