import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRoutePoints } from '../fixtures/mockRouteData';

// Mock Next.js server functions
const mockJson = vi.fn();

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      mockJson(data, init);
      return { data, ...init };
    },
  },
  NextRequest: class MockNextRequest {
    async json() {
      return {};
    }
  },
}));

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('/api/analyze', () => {
    it('should validate that points array is required', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({}),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Valid route points are required' },
        { status: 400 }
      );
    });

    it('should validate that points array is not empty', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: [] }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Valid route points are required' },
        { status: 400 }
      );
    });

    it('should validate point structure', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const invalidPoints = [
        { lat: 37.7749, lng: -122.4194 }, // missing elevation and distance
      ];

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: invalidPoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Invalid point data structure' },
        { status: 400 }
      );
    });

    it('should successfully analyze valid route points', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: mockRoutePoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      const callArgs = mockJson.mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        success: true,
        analysis: {
          totalDistance: expect.any(Number),
          totalElevationGain: expect.any(Number),
          totalElevationLoss: expect.any(Number),
          segments: expect.any(Array),
          summary: expect.any(String),
          points: mockRoutePoints,
        },
      });
    });

    it('should include activityId when provided', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          points: mockRoutePoints,
          activityId: '123456',
        }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      const callArgs = mockJson.mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        success: true,
        analysis: expect.any(Object),
      });
    });

    it('should handle analysis errors gracefully', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      // Points that might cause issues
      const problematicPoints = [
        { lat: NaN, lng: NaN, elevation: NaN, distance: NaN },
      ];

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: problematicPoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      // Should still return a response (might be success with NaN values or error)
      expect(mockJson).toHaveBeenCalled();
    });

    it('should return analysis with all required fields', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: mockRoutePoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      const response = mockJson.mock.calls[0][0];
      
      expect(response.success).toBe(true);
      expect(response.analysis).toHaveProperty('totalDistance');
      expect(response.analysis).toHaveProperty('totalElevationGain');
      expect(response.analysis).toHaveProperty('totalElevationLoss');
      expect(response.analysis).toHaveProperty('segments');
      expect(response.analysis).toHaveProperty('summary');
      expect(response.analysis).toHaveProperty('points');
    });
  });

  describe('API Route Input Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Failed to analyze route' },
        { status: 500 }
      );
    });

    it('should handle points with wrong data types', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const invalidPoints = [
        { lat: '37.7749', lng: '-122.4194', elevation: '100', distance: '0' }, // strings instead of numbers
      ];

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: invalidPoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Invalid point data structure' },
        { status: 400 }
      );
    });

    it('should handle null points', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: null }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Valid route points are required' },
        { status: 400 }
      );
    });

    it('should handle undefined points', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: undefined }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Valid route points are required' },
        { status: 400 }
      );
    });

    it('should handle points with missing required fields', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      const incompletePoints = [
        { lat: 37.7749, lng: -122.4194, elevation: 100 }, // missing distance
      ];

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: incompletePoints }),
      } as unknown as InstanceType<typeof NextRequest>;

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Invalid point data structure' },
        { status: 400 }
      );
    });

    it('should handle very large points array efficiently', async () => {
      const { POST } = await import('@/app/api/analyze/route');
      const { NextRequest } = await import('next/server');

      // Generate 10000 points
      const largePointsArray = Array.from({ length: 10000 }, (_, i) => ({
        lat: 37.7749 + i * 0.0001,
        lng: -122.4194 + i * 0.0001,
        elevation: 100 + Math.sin(i / 100) * 50,
        distance: i * 10,
      }));

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ points: largePointsArray }),
      } as unknown as InstanceType<typeof NextRequest>;

      const startTime = Date.now();
      await POST(mockRequest);
      const endTime = Date.now();

      // Should complete in reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      const callArgs = mockJson.mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        success: true,
      });
    });
  });
});
