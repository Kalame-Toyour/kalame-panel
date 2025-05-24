import NodeCache from 'node-cache';

export class CacheManager {
  private static instance: CacheManager;
  private cache: NodeCache;

  private constructor() {
    // Standard TTL of 15 minutes, check for expired keys every 5 minutes
    this.cache = new NodeCache({
      stdTTL: 900,
      checkperiod: 300,
    });
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Generic set method
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? 900);
  }

  // Generic get method
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  // Delete a specific key
  delete(key: string): number {
    return this.cache.del(key);
  }

  // Check if a key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Create a cache key with optional prefix
  createCacheKey(prefix: string, ...args: string[]): string {
    return `${prefix}:${args.join(':')}`;
  }
}

// Export a singleton instance
export const cacheManager = CacheManager.getInstance();
