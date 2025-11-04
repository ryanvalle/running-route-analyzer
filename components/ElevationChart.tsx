'use client';

import { useMemo } from 'react';
import { RoutePoint } from '@/types';
import { METERS_TO_MILES, FEET_PER_METER } from '@/lib/constants';

interface ElevationChartProps {
  points: RoutePoint[];
}

export default function ElevationChart({ points }: ElevationChartProps) {
  // Process points for display
  const chartData = useMemo(() => {
    if (!points || points.length === 0) return [];
    
    return points.map(point => ({
      distance: point.distance * METERS_TO_MILES,
      elevation: point.elevation * FEET_PER_METER,
    }));
  }, [points]);

  const { minElevation, maxElevation, elevationRange } = useMemo(() => {
    if (chartData.length === 0) {
      return { minElevation: 0, maxElevation: 0, elevationRange: 0 };
    }
    
    const elevations = chartData.map(d => d.elevation);
    const min = Math.min(...elevations);
    const max = Math.max(...elevations);
    const range = max - min;
    
    // Add 10% padding to top and bottom
    const padding = range * 0.1;
    return {
      minElevation: min - padding,
      maxElevation: max + padding,
      elevationRange: range + 2 * padding,
    };
  }, [chartData]);

  // Create SVG path
  const pathData = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const maxDistance = chartData[chartData.length - 1].distance;
    const width = 1000; // SVG viewBox width
    const height = 200; // SVG viewBox height
    
    const points = chartData.map(d => {
      const x = (d.distance / maxDistance) * width;
      const y = height - ((d.elevation - minElevation) / elevationRange) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [chartData, minElevation, elevationRange]);

  // Create filled area path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const maxDistance = chartData[chartData.length - 1].distance;
    const width = 1000;
    const height = 200;
    
    const points = chartData.map(d => {
      const x = (d.distance / maxDistance) * width;
      const y = height - ((d.elevation - minElevation) / elevationRange) * height;
      return `${x},${y}`;
    });
    
    // Start at bottom left, draw the elevation line, then close at bottom right
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  }, [chartData, minElevation, elevationRange]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No elevation data available</p>
      </div>
    );
  }

  const maxDistance = chartData[chartData.length - 1].distance;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Elevation Profile
      </h2>
      <div className="w-full">
        <svg
          viewBox="0 0 1000 200"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="100" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 100 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-300 dark:text-gray-600"
              />
            </pattern>
          </defs>
          <rect width="1000" height="200" fill="url(#grid)" />
          
          {/* Filled area under the line */}
          <path
            d={areaPath}
            fill="currentColor"
            className="text-blue-200 dark:text-blue-900"
            opacity="0.5"
          />
          
          {/* Elevation line */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-600 dark:text-blue-400"
          />
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>0 mi</span>
          <span>{(maxDistance / 4).toFixed(1)} mi</span>
          <span>{(maxDistance / 2).toFixed(1)} mi</span>
          <span>{(3 * maxDistance / 4).toFixed(1)} mi</span>
          <span>{maxDistance.toFixed(1)} mi</span>
        </div>
        
        {/* Y-axis info */}
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Elevation: {Math.round(minElevation + elevationRange * 0.1)} - {Math.round(maxElevation - elevationRange * 0.1)} ft</span>
        </div>
      </div>
    </div>
  );
}
