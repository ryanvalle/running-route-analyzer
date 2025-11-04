'use client';

import { useMemo, useState, useRef, useEffect, MouseEvent } from 'react';
import { RoutePoint } from '@/types';
import { METERS_TO_MILES, FEET_PER_METER } from '@/lib/constants';

// SVG dimensions for the elevation chart
const CHART_WIDTH = 1000;
const CHART_HEIGHT = 200;
const TOOLTIP_OFFSET_TOP = -45; // Pixels above the cursor for tooltip positioning

interface ElevationChartProps {
  points: RoutePoint[];
  segments?: Array<{ startMile: number; endMile: number }>;
  hoveredSegmentIndex?: number | null;
  onHoverPoint?: (point: RoutePoint | null) => void;
}

export default function ElevationChart({ points, segments, hoveredSegmentIndex, onHoverPoint }: ElevationChartProps) {
  const [hoveredDistance, setHoveredDistance] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Process points for display
  const chartData = useMemo(() => {
    if (!points || points.length === 0) return [];
    
    return points.map(point => ({
      distance: point.distance * METERS_TO_MILES,
      elevation: point.elevation * FEET_PER_METER,
    }));
  }, [points]);

  const { minElevation, elevationRange, actualMin, actualMax } = useMemo(() => {
    if (chartData.length === 0) {
      return { minElevation: 0, elevationRange: 0, actualMin: 0, actualMax: 0 };
    }
    
    const elevations = chartData.map(d => d.elevation);
    const actualMin = Math.min(...elevations);
    const actualMax = Math.max(...elevations);
    const range = actualMax - actualMin;
    
    // Add 10% padding to top and bottom for better visualization
    const padding = range * 0.1;
    return {
      minElevation: actualMin - padding,
      elevationRange: range + 2 * padding,
      actualMin,
      actualMax,
    };
  }, [chartData]);

  // Create SVG path
  const pathData = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const maxDistance = chartData[chartData.length - 1].distance;
    
    const points = chartData.map(d => {
      const x = (d.distance / maxDistance) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((d.elevation - minElevation) / elevationRange) * CHART_HEIGHT;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [chartData, minElevation, elevationRange]);

  // Create filled area path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const maxDistance = chartData[chartData.length - 1].distance;
    
    const points = chartData.map(d => {
      const x = (d.distance / maxDistance) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((d.elevation - minElevation) / elevationRange) * CHART_HEIGHT;
      return `${x},${y}`;
    });
    
    // Start at bottom left, draw the elevation line, then close at bottom right
    return `M 0,${CHART_HEIGHT} L ${points.join(' L ')} L ${CHART_WIDTH},${CHART_HEIGHT} Z`;
  }, [chartData, minElevation, elevationRange]);

  // Create highlighted segment area path
  const highlightedSegmentPath = useMemo(() => {
    if (chartData.length === 0 || !segments || hoveredSegmentIndex === null || hoveredSegmentIndex === undefined) {
      return null;
    }
    
    const segment = segments[hoveredSegmentIndex];
    if (!segment) return null;
    
    const maxDistance = chartData[chartData.length - 1].distance;
    
    // Filter points within the segment
    const segmentPoints = chartData.filter(d => 
      d.distance >= segment.startMile && d.distance <= segment.endMile
    );
    
    if (segmentPoints.length === 0) return null;
    
    const points = segmentPoints.map(d => {
      const x = (d.distance / maxDistance) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((d.elevation - minElevation) / elevationRange) * CHART_HEIGHT;
      return `${x},${y}`;
    });
    
    // Create filled area for segment
    const startX = (segment.startMile / maxDistance) * CHART_WIDTH;
    const endX = (segment.endMile / maxDistance) * CHART_WIDTH;
    
    return `M ${startX},${CHART_HEIGHT} L ${points.join(' L ')} L ${endX},${CHART_HEIGHT} Z`;
  }, [chartData, segments, hoveredSegmentIndex, minElevation, elevationRange]);

  // Find closest point to hovered distance
  const hoveredPoint = useMemo(() => {
    if (hoveredDistance === null || chartData.length === 0) return null;
    
    // Find the point closest to the hovered distance
    let closestPoint = points[0];
    let minDiff = Math.abs(points[0].distance * METERS_TO_MILES - hoveredDistance);
    
    for (const point of points) {
      const pointDistance = point.distance * METERS_TO_MILES;
      const diff = Math.abs(pointDistance - hoveredDistance);
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    }
    
    return closestPoint;
  }, [hoveredDistance, points, chartData.length]);

  // Handle mouse move on chart
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartData.length === 0) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Calculate the distance based on x position
    const maxDistance = chartData[chartData.length - 1].distance;
    const relativeX = x / rect.width;
    const distance = relativeX * maxDistance;
    
    setHoveredDistance(distance);
  };

  const handleMouseLeave = () => {
    setHoveredDistance(null);
    if (onHoverPoint) {
      onHoverPoint(null);
    }
  };

  // Notify parent when hovered point changes
  useEffect(() => {
    if (onHoverPoint) {
      onHoverPoint(hoveredPoint);
    }
  }, [hoveredPoint, onHoverPoint]);

  // Calculate hover cursor position and info
  const hoverInfo = useMemo(() => {
    if (hoveredDistance === null || chartData.length === 0) return null;
    
    const maxDistance = chartData[chartData.length - 1].distance;
    const x = (hoveredDistance / maxDistance) * CHART_WIDTH;
    
    // Find elevation at this distance from chartData (already in feet)
    let elevation = 0;
    if (hoveredPoint) {
      // hoveredPoint.elevation is in meters, convert to feet
      elevation = hoveredPoint.elevation * FEET_PER_METER;
    }
    
    const y = CHART_HEIGHT - ((elevation - minElevation) / elevationRange) * CHART_HEIGHT;
    
    return {
      x,
      y,
      distance: hoveredDistance,
      elevation,
    };
  }, [hoveredDistance, chartData, minElevation, elevationRange, hoveredPoint]);

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
      <div className="w-full relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-auto cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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
          <rect width={CHART_WIDTH} height={CHART_HEIGHT} fill="url(#grid)" />
          
          {/* Filled area under the line */}
          <path
            d={areaPath}
            fill="currentColor"
            className="text-blue-200 dark:text-blue-900"
            opacity="0.5"
          />
          
          {/* Highlighted segment area */}
          {highlightedSegmentPath && (
            <path
              d={highlightedSegmentPath}
              fill="currentColor"
              className="text-red-300 dark:text-red-700"
              opacity="0.7"
            />
          )}
          
          {/* Elevation line */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-600 dark:text-blue-400"
          />
          
          {/* Hover cursor line and dot */}
          {hoverInfo && (
            <>
              {/* Vertical line at cursor */}
              <line
                x1={hoverInfo.x}
                y1="0"
                x2={hoverInfo.x}
                y2={CHART_HEIGHT}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-gray-600 dark:text-gray-400"
              />
              
              {/* Dot on the elevation line */}
              <circle
                cx={hoverInfo.x}
                cy={hoverInfo.y}
                r="5"
                fill="currentColor"
                className="text-red-600 dark:text-red-400"
              />
              <circle
                cx={hoverInfo.x}
                cy={hoverInfo.y}
                r="3"
                fill="white"
              />
            </>
          )}
        </svg>
        
        {/* Tooltip */}
        {hoverInfo && (
          <div
            className="absolute bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg"
            style={{
              left: `${(hoverInfo.x / CHART_WIDTH) * 100}%`,
              top: `${TOOLTIP_OFFSET_TOP}px`,
              transform: 'translateX(-50%)',
            }}
            role="tooltip"
            aria-label={`Elevation ${Math.round(hoverInfo.elevation)} feet at distance ${hoverInfo.distance.toFixed(2)} miles`}
          >
            <div className="font-semibold">{hoverInfo.distance.toFixed(2)} mi</div>
            <div>{Math.round(hoverInfo.elevation)} ft</div>
          </div>
        )}
        
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
          <span>Elevation: {Math.round(actualMin)} - {Math.round(actualMax)} ft</span>
        </div>
      </div>
    </div>
  );
}
