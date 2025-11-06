# cache.ts

## Overview
Simple in-memory cache with TTL (time-to-live) support.

## File Location
`lib/cache.ts`

## Cache Class

### Constructor
```typescript
constructor(defaultTTL: number = 3600000) // 1 hour in milliseconds
```

### Methods

#### `set<T>(key: string, value: T): void`
Store a value in cache

```typescript
cache.set('myKey', { data: 'value' });
```

#### `get<T>(key: string, ttl?: number): T | null`
Retrieve a value from cache

**Returns**: Value if exists and not expired, otherwise `null`

**TTL**: Optional override for default TTL

```typescript
const value = cache.get<MyType>('myKey');
if (value) {
  // Use cached value
}
```

#### `has(key: string, ttl?: number): boolean`
Check if key exists and is not expired

```typescript
if (cache.has('myKey')) {
  // Key exists
}
```

#### `delete(key: string): void`
Remove a key from cache

```typescript
cache.delete('myKey');
```

#### `clear(): void`
Clear all cached data

```typescript
cache.clear();
```

## Cache Key Generators

### `getCacheKey` Object
Helper functions to generate consistent cache keys:

```typescript
export const getCacheKey = {
  stravaActivity: (activityId: string | number) => `strava:activity:${activityId}`,
  stravaUser: (userId: string | number) => `strava:user:${userId}`,
  analysis: (activityId: string | number) => `analysis:${activityId}`,
  aiCoachingInsights: (activityId: string | number) => `ai:coaching:${activityId}`,
};
```

**Usage**:
```typescript
import { cache, getCacheKey } from '@/lib/cache';

const cacheKey = getCacheKey.aiCoachingInsights(activityId);
cache.set(cacheKey, insights);
```

## Default Configuration

### TTL (Time-To-Live)
- **Default**: 1 hour (3600000 milliseconds)
- **Purpose**: Prevent stale data
- **Behavior**: Expired entries automatically return `null`

### Storage
- **Type**: In-memory (Map)
- **Persistence**: None (cleared on server restart)
- **Scope**: Per server instance

## Cache Entry Structure

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number; // Date.now() when stored
}
```

## TTL Logic

```typescript
const age = Date.now() - entry.timestamp;
const maxAge = ttl || this.defaultTTL;

if (age > maxAge) {
  this.store.delete(key);
  return null;
}
```

## Usage Examples

### AI Insights Caching
```typescript
const cacheKey = getCacheKey.aiCoachingInsights(activityId);
const cached = cache.get<string>(cacheKey);

if (cached) {
  return cached;
}

const insights = await generateInsights();
cache.set(cacheKey, insights);
```

### GPX Data Caching
```typescript
const gpxId = randomUUID();
cache.set(`gpx:${gpxId}`, {
  points,
  analysis,
});

// Later retrieval
const data = cache.get(`gpx:${gpxId}`);
```

## Production Considerations

### Limitations
- No persistence (data lost on restart)
- No distributed caching (each instance has own cache)
- No size limits (could grow unbounded)
- No eviction policy beyond TTL

### Recommendations for Production
- Use Redis or Memcached for persistence
- Implement distributed caching for multi-instance deployments
- Add size limits and LRU eviction
- Monitor cache hit/miss rates

## Testing

### Manual Testing
```typescript
cache.set('test', 'value');
console.log(cache.get('test')); // 'value'

// Wait for TTL
setTimeout(() => {
  console.log(cache.get('test', 1000)); // null (expired)
}, 2000);
```

### Unit Tests
Currently no tests exist. Consider adding:
- TTL expiration tests
- Get/set tests
- Delete tests
- Clear tests
- Type safety tests

## Used By

- `lib/openai.ts` - AI coaching insights
- `app/api/analyze/route.ts` - GPX analysis
- `app/api/gpx-analysis/[gpxId]/route.ts` - GPX retrieval

## Related Documentation

- [OpenAI Integration](./openai.md)
- [Analyze API](../api-routes/analyze.md)
- [GPX Analysis API](../api-routes/gpx-analysis.md)
