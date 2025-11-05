import { describe, it, expect } from 'vitest';
import { analyzeRoute, metersToMiles, metersToFeet } from '@/lib/routeAnalysis';
import { mockRoutePoints, emptyRoutePoints, singlePointRoute } from '../fixtures/mockRouteData';
import { RoutePoint } from '@/types';

describe('routeAnalysis', () => {
  describe('analyzeRoute', () => {
    it('should analyze a valid route with multiple segments', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      expect(result).toBeDefined();
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.totalElevationGain).toBeGreaterThan(0);
      expect(result.totalElevationLoss).toBeGreaterThan(0);
      expect(result.segments).toHaveLength(5); // 5 mile route
      expect(result.summary).toBeTruthy();
    });

    it('should calculate correct total distance', () => {
      const result = analyzeRoute(mockRoutePoints);
      // Last point distance is 8047 meters = ~5 miles
      expect(result.totalDistance).toBeCloseTo(5.0, 1);
    });

    it('should calculate elevation gain and loss', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      // Should have positive elevation gain
      expect(result.totalElevationGain).toBeGreaterThan(0);
      // Should have positive elevation loss (even if route net goes up)
      expect(result.totalElevationLoss).toBeGreaterThan(0);
    });

    it('should create mile-based segments', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      result.segments.forEach((segment, index) => {
        expect(segment.startMile).toBe(index);
        expect(segment.endMile).toBeGreaterThan(segment.startMile);
        expect(segment.elevationGain).toBeGreaterThanOrEqual(0);
        expect(segment.elevationLoss).toBeGreaterThanOrEqual(0);
        expect(segment.description).toBeTruthy();
        expect(typeof segment.avgGrade).toBe('number');
      });
    });

    it('should assign correct terrain descriptions', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      // Check that terrain descriptions are from expected set
      const validDescriptions = [
        'Relatively flat',
        'Gentle climb',
        'Moderate climb',
        'Steep climb',
        'Gentle descent',
        'Moderate descent',
        'Steep descent',
      ];
      
      result.segments.forEach((segment) => {
        expect(validDescriptions).toContain(segment.description);
      });
    });

    it('should handle empty route points', () => {
      const result = analyzeRoute(emptyRoutePoints);
      
      expect(result.totalDistance).toBe(0);
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalElevationLoss).toBe(0);
      expect(result.segments).toEqual([]);
      expect(result.summary).toBe('No route data available');
    });

    it('should handle single point route', () => {
      const result = analyzeRoute(singlePointRoute);
      
      expect(result.totalDistance).toBe(0);
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalElevationLoss).toBe(0);
      expect(result.segments).toEqual([]);
    });

    it('should handle route with two points', () => {
      const twoPoints: RoutePoint[] = [
        { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
        { lat: 37.7750, lng: -122.4195, elevation: 110, distance: 1609 }, // 1 mile
      ];
      
      const result = analyzeRoute(twoPoints);
      
      expect(result.totalDistance).toBeCloseTo(1.0, 1);
      expect(result.totalElevationGain).toBeGreaterThan(0);
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
    });

    it('should calculate grade percentages correctly', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      result.segments.forEach((segment) => {
        // Grade should be a reasonable percentage
        expect(Math.abs(segment.avgGrade)).toBeLessThan(50); // No segment should be steeper than 50%
        
        // Verify grade sign matches terrain description
        if (segment.description.includes('climb')) {
          expect(segment.avgGrade).toBeGreaterThanOrEqual(0);
        } else if (segment.description.includes('descent')) {
          expect(segment.avgGrade).toBeLessThanOrEqual(0);
        } else if (segment.description.includes('flat')) {
          expect(Math.abs(segment.avgGrade)).toBeLessThan(1);
        }
      });
    });

    it('should generate meaningful summary', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      expect(result.summary).toBeTruthy();
      expect(result.summary.length).toBeGreaterThan(10);
      expect(result.summary).toMatch(/mile/i);
    });

    it('should handle route with only uphill', () => {
      const uphillPoints: RoutePoint[] = [
        { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
        { lat: 37.7750, lng: -122.4195, elevation: 120, distance: 1609 },
        { lat: 37.7751, lng: -122.4196, elevation: 140, distance: 3219 },
      ];
      
      const result = analyzeRoute(uphillPoints);
      
      expect(result.totalElevationGain).toBeGreaterThan(0);
      expect(result.totalElevationLoss).toBe(0);
    });

    it('should handle route with only downhill', () => {
      const downhillPoints: RoutePoint[] = [
        { lat: 37.7749, lng: -122.4194, elevation: 200, distance: 0 },
        { lat: 37.7750, lng: -122.4195, elevation: 180, distance: 1609 },
        { lat: 37.7751, lng: -122.4196, elevation: 160, distance: 3219 },
      ];
      
      const result = analyzeRoute(downhillPoints);
      
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalElevationLoss).toBeGreaterThan(0);
    });

    it('should handle route with perfectly flat terrain', () => {
      const flatPoints: RoutePoint[] = [
        { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
        { lat: 37.7750, lng: -122.4195, elevation: 100, distance: 1609 },
        { lat: 37.7751, lng: -122.4196, elevation: 100, distance: 3219 },
      ];
      
      const result = analyzeRoute(flatPoints);
      
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalElevationLoss).toBe(0);
      result.segments.forEach((segment) => {
        expect(segment.description).toBe('Relatively flat');
        expect(Math.abs(segment.avgGrade)).toBeLessThan(1);
      });
    });

    it('should handle very short routes (< 1 mile)', () => {
      const shortRoute: RoutePoint[] = [
        { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
        { lat: 37.7750, lng: -122.4195, elevation: 105, distance: 400 }, // ~0.25 miles
      ];
      
      const result = analyzeRoute(shortRoute);
      
      expect(result.totalDistance).toBeLessThan(1);
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
    });

    it('should not have negative distances or elevations in segments', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      result.segments.forEach((segment) => {
        expect(segment.startMile).toBeGreaterThanOrEqual(0);
        expect(segment.endMile).toBeGreaterThan(segment.startMile);
        expect(segment.elevationGain).toBeGreaterThanOrEqual(0);
        expect(segment.elevationLoss).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have segments that cover the entire route', () => {
      const result = analyzeRoute(mockRoutePoints);
      
      // First segment should start at 0
      expect(result.segments[0].startMile).toBe(0);
      
      // Last segment should end at or near total distance
      const lastSegment = result.segments[result.segments.length - 1];
      expect(lastSegment.endMile).toBeCloseTo(result.totalDistance, 1);
      
      // Segments should be continuous
      for (let i = 1; i < result.segments.length; i++) {
        expect(result.segments[i].startMile).toBe(result.segments[i - 1].endMile);
      }
    });
  });

  describe('metersToMiles', () => {
    it('should convert meters to miles correctly', () => {
      expect(metersToMiles(1609.34)).toBeCloseTo(1.0, 2);
      expect(metersToMiles(8046.72)).toBeCloseTo(5.0, 2);
      expect(metersToMiles(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      // Use exact conversion factor to avoid precision issues
      expect(metersToMiles(1609.344 / 2)).toBeCloseTo(0.5, 5);
    });
  });

  describe('metersToFeet', () => {
    it('should convert meters to feet correctly', () => {
      expect(metersToFeet(1)).toBeCloseTo(3.28084, 2);
      expect(metersToFeet(100)).toBeCloseTo(328.084, 1);
      expect(metersToFeet(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(metersToFeet(0.5)).toBeCloseTo(1.64042, 2);
    });
  });
});
