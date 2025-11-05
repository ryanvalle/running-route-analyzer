import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockAnalysis, mockAICoachingInsights } from '../fixtures/mockRouteData';
import { cache, getCacheKey } from '@/lib/cache';

// Mock the OpenAI module with a factory function
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  
  class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
    
    constructor(public config: { apiKey: string }) {}
  }
  
  return {
    default: MockOpenAI,
  };
});

// Import after mocking
import { getOpenAIClient, getAICoachingInsights } from '@/lib/openai';
import OpenAI from 'openai';

describe('openai', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
    // Reset environment
    vi.resetModules();
    process.env = { ...originalEnv };
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('getOpenAIClient', () => {
    it('should return null when API key is not configured', () => {
      delete process.env.OPENAI_API_KEY;
      const client = getOpenAIClient();
      expect(client).toBeNull();
    });

    it('should return OpenAI client when API key is configured', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const client = getOpenAIClient();
      expect(client).toBeTruthy();
    });
  });

  describe('getAICoachingInsights', () => {
    it('should return null when OpenAI is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      const result = await getAICoachingInsights(mockAnalysis);
      expect(result).toBeNull();
    });

    it('should call OpenAI API and return insights when configured', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      // Get the mocked create function
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAICoachingInsights,
            },
          },
        ],
      } as any);

      const result = await getAICoachingInsights(mockAnalysis);
      
      expect(result).toBe(mockAICoachingInsights);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 1000,
        })
      );
    });

    it('should cache insights when activityId is provided', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAICoachingInsights,
            },
          },
        ],
      } as any);

      const activityId = '123456';
      const cacheKey = getCacheKey.aiCoachingInsights(activityId);

      // First call should hit API
      const result1 = await getAICoachingInsights(mockAnalysis, activityId);
      expect(result1).toBe(mockAICoachingInsights);
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Verify it's cached
      expect(cache.has(cacheKey)).toBe(true);

      // Second call should use cache
      const result2 = await getAICoachingInsights(mockAnalysis, activityId);
      expect(result2).toBe(mockAICoachingInsights);
      expect(mockCreate).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should not cache insights when activityId is not provided', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAICoachingInsights,
            },
          },
        ],
      } as any);

      // First call
      await getAICoachingInsights(mockAnalysis);
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Second call should hit API again (no caching without activityId)
      await getAICoachingInsights(mockAnalysis);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should return null when OpenAI returns no choices', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [],
      } as any);

      const result = await getAICoachingInsights(mockAnalysis);
      expect(result).toBeNull();
    });

    it('should return null when OpenAI returns no content', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      } as any);

      const result = await getAICoachingInsights(mockAnalysis);
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockRejectedValue(new Error('API Error'));

      const result = await getAICoachingInsights(mockAnalysis);
      expect(result).toBeNull();
    });

    it('should use cached insights on subsequent calls even if activityId is string or number', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const client = new OpenAI({ apiKey: 'test' });
      const mockCreate = client.chat.completions.create as ReturnType<typeof vi.fn>;
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAICoachingInsights,
            },
          },
        ],
      } as any);

      // Call with string activityId
      await getAICoachingInsights(mockAnalysis, '999');
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Call with number activityId (should use same cache key)
      const result = await getAICoachingInsights(mockAnalysis, 999);
      expect(result).toBe(mockAICoachingInsights);
      expect(mockCreate).toHaveBeenCalledTimes(1); // Should use cache
    });
  });
});
