import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cache, getCacheKey } from '@/lib/cache';

describe('Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      cache.set('test-key', 'test-value');
      expect(cache.get('test-key')).toBe('test-value');
    });

    it('should store and retrieve complex objects', () => {
      const complexObject = {
        id: 123,
        name: 'Test Activity',
        data: [1, 2, 3],
        nested: { value: 'nested' },
      };
      cache.set('complex-key', complexObject);
      expect(cache.get('complex-key')).toEqual(complexObject);
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'text');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('array', [1, 2, 3]);
      cache.set('null', null);

      expect(cache.get('string')).toBe('text');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('null')).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect default TTL', () => {
      vi.useFakeTimers();
      
      cache.set('ttl-test', 'value');
      expect(cache.get('ttl-test')).toBe('value');
      
      // Fast-forward time by 1 hour (default TTL)
      vi.advanceTimersByTime(3600000);
      expect(cache.get('ttl-test')).toBe('value');
      
      // Fast-forward time by 1 more millisecond (past TTL)
      vi.advanceTimersByTime(1);
      expect(cache.get('ttl-test')).toBeNull();
      
      vi.useRealTimers();
    });

    it('should respect custom TTL', () => {
      vi.useFakeTimers();
      
      cache.set('custom-ttl', 'value');
      
      // Custom TTL of 5 seconds
      const customTTL = 5000;
      
      // Should be available before TTL expires
      vi.advanceTimersByTime(4999);
      expect(cache.get('custom-ttl', customTTL)).toBe('value');
      
      // Should be expired after TTL
      vi.advanceTimersByTime(2);
      expect(cache.get('custom-ttl', customTTL)).toBeNull();
      
      vi.useRealTimers();
    });

    it('should delete expired entries when accessed', () => {
      vi.useFakeTimers();
      
      cache.set('expire-test', 'value');
      
      // Fast-forward past TTL
      vi.advanceTimersByTime(3600001);
      
      // Accessing should return null and delete the entry
      expect(cache.get('expire-test')).toBeNull();
      
      // Entry should be deleted from internal store
      expect(cache.has('expire-test')).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cache.set('exists', 'value');
      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('does-not-exist')).toBe(false);
    });

    it('should return false for expired keys', () => {
      vi.useFakeTimers();
      
      cache.set('will-expire', 'value');
      expect(cache.has('will-expire')).toBe(true);
      
      // Fast-forward past TTL
      vi.advanceTimersByTime(3600001);
      expect(cache.has('will-expire')).toBe(false);
      
      vi.useRealTimers();
    });

    it('should respect custom TTL', () => {
      vi.useFakeTimers();
      
      cache.set('custom-has-ttl', 'value');
      
      const customTTL = 5000;
      vi.advanceTimersByTime(4999);
      expect(cache.has('custom-has-ttl', customTTL)).toBe(true);
      
      vi.advanceTimersByTime(2);
      expect(cache.has('custom-has-ttl', customTTL)).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should delete an existing key', () => {
      cache.set('to-delete', 'value');
      expect(cache.has('to-delete')).toBe(true);
      
      cache.delete('to-delete');
      expect(cache.has('to-delete')).toBe(false);
      expect(cache.get('to-delete')).toBeNull();
    });

    it('should not throw when deleting non-existent key', () => {
      expect(() => cache.delete('does-not-exist')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      
      cache.clear();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });
  });

  describe('getCacheKey helpers', () => {
    it('should generate correct Strava activity cache key', () => {
      expect(getCacheKey.stravaActivity(123456)).toBe('strava:activity:123456');
      expect(getCacheKey.stravaActivity('123456')).toBe('strava:activity:123456');
    });

    it('should generate correct Strava user cache key', () => {
      expect(getCacheKey.stravaUser(789)).toBe('strava:user:789');
      expect(getCacheKey.stravaUser('789')).toBe('strava:user:789');
    });

    it('should generate correct analysis cache key', () => {
      expect(getCacheKey.analysis(456)).toBe('analysis:456');
      expect(getCacheKey.analysis('456')).toBe('analysis:456');
    });

    it('should generate correct AI coaching insights cache key', () => {
      expect(getCacheKey.aiCoachingInsights(789)).toBe('ai:coaching:789');
      expect(getCacheKey.aiCoachingInsights('789')).toBe('ai:coaching:789');
    });
  });

  describe('cache isolation', () => {
    it('should maintain separate values for different keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should allow overwriting existing keys', () => {
      cache.set('overwrite', 'original');
      expect(cache.get('overwrite')).toBe('original');
      
      cache.set('overwrite', 'updated');
      expect(cache.get('overwrite')).toBe('updated');
    });
  });
});
