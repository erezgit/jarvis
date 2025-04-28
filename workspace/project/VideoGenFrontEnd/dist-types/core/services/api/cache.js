/**
 * API response caching system
 */
export class ApiCache {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Get cached data if it exists and hasn't expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if entry has expired
        if (Date.now() - entry.timestamp >= entry.expiresIn) {
            this.invalidate(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Cache data with expiration
     */
    set(key, data, expiresIn = ApiCache.DEFAULT_EXPIRY) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresIn,
        });
    }
    /**
     * Remove item from cache
     */
    invalidate(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all expired entries
     */
    clearExpired() {
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
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
}
Object.defineProperty(ApiCache, "DEFAULT_EXPIRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5 * 60 * 1000
}); // 5 minutes
