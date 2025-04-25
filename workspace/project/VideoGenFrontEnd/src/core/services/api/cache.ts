/**
 * API response caching system
 */

export interface ICacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class ApiCache {
  private cache = new Map<string, ICacheEntry<unknown>>();
  private static readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp >= entry.expiresIn) {
      this.invalidate(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Cache data with expiration
   */
  set<T>(key: string, data: T, expiresIn = ApiCache.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Remove item from cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.expiresIn) {
        this.invalidate(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
