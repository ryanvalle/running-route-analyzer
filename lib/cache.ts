// Simple in-memory cache with TTL support
// For production, consider using Redis or a similar cache store

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private store: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600000) { // 1 hour in milliseconds
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const maxAge = ttl || this.defaultTTL;

    if (age > maxAge) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string, ttl?: number): boolean {
    return this.get(key, ttl) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Export a singleton instance
export const cache = new Cache(3600000); // 1 hour TTL

// Cache key generators
export const getCacheKey = {
  stravaActivity: (activityId: string | number) => `strava:activity:${activityId}`,
  stravaUser: (userId: string | number) => `strava:user:${userId}`,
  analysis: (activityId: string | number) => `analysis:${activityId}`,
};
