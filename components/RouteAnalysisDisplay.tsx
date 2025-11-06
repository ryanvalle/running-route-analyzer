'use client';

import { useState, useMemo, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { RouteAnalysis, RoutePoint, DistanceUnit, SegmentIncrement } from '@/types';
import ElevationChart from './ElevationChart';
import { METERS_TO_MILES, METERS_TO_KILOMETERS } from '@/lib/constants';
import { analyzeRoute } from '@/lib/routeAnalysis';

// Dynamically import RouteMap to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

interface RouteAnalysisDisplayProps {
  analysis: RouteAnalysis;
  onSettingsChange?: (unit: DistanceUnit, increment: SegmentIncrement) => void;
}

export interface RouteAnalysisDisplayRef {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
}

const RouteAnalysisDisplay = forwardRef<RouteAnalysisDisplayRef, RouteAnalysisDisplayProps>(
  function RouteAnalysisDisplay({ analysis: initialAnalysis, onSettingsChange }, ref) {
  const [manualHoveredSegmentIndex, setManualHoveredSegmentIndex] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<RoutePoint | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Settings state with localStorage persistence
  const [unit, setUnit] = useState<DistanceUnit>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('routeAnalyzerUnit');
      return (saved as DistanceUnit) || initialAnalysis.unit || 'miles';
    }
    return initialAnalysis.unit || 'miles';
  });
  
  const [increment, setIncrement] = useState<SegmentIncrement>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('routeAnalyzerIncrement');
      return (saved ? parseFloat(saved) as SegmentIncrement : null) || initialAnalysis.increment || 1;
    }
    return initialAnalysis.increment || 1;
  });
  
  // Recompute analysis when settings change
  const analysis = useMemo(() => {
    if (!initialAnalysis.points || initialAnalysis.points.length === 0) {
      return initialAnalysis;
    }
    
    // If settings match initial, return as-is
    if (unit === initialAnalysis.unit && increment === initialAnalysis.increment) {
      return initialAnalysis;
    }
    
    // Recompute with new settings
    const recomputed = analyzeRoute(initialAnalysis.points, unit, increment);
    // Preserve AI insights and points from original
    return {
      ...recomputed,
      aiCoachingInsights: initialAnalysis.aiCoachingInsights,
      points: initialAnalysis.points,
    };
  }, [initialAnalysis, unit, increment]);
  
  // Save settings to localStorage and notify parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('routeAnalyzerUnit', unit);
      localStorage.setItem('routeAnalyzerIncrement', increment.toString());
    }
    if (onSettingsChange) {
      onSettingsChange(unit, increment);
    }
  }, [unit, increment, onSettingsChange]);

  // Expose refs to parent component
  useImperativeHandle(ref, () => ({
    mapContainerRef,
    chartContainerRef,
  }));

  // Calculate the segment index based on hovered point - memoized to avoid recalculation
  const hoveredSegmentFromPoint = useMemo(() => {
    if (!hoveredPoint || !analysis.segments) return -1;
    
    const conversionFactor = unit === 'miles' ? METERS_TO_MILES : METERS_TO_KILOMETERS;
    const distance = hoveredPoint.distance * conversionFactor;
    return analysis.segments.findIndex(segment => 
      distance >= segment.startMile && distance < segment.endMile
    );
  }, [hoveredPoint, analysis.segments, unit]);
  
  // Use either the manually hovered segment or the one from chart hover
  const hoveredSegmentIndex = manualHoveredSegmentIndex !== null 
    ? manualHoveredSegmentIndex 
    : (hoveredSegmentFromPoint !== -1 ? hoveredSegmentFromPoint : null);

  const handleChartHover = (point: RoutePoint | null) => {
    setHoveredPoint(point);
    // Clear manual segment hover when hovering on chart
    if (point !== null) {
      setManualHoveredSegmentIndex(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Route Summary
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Settings Controls */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Display Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Distance Unit
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('miles')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'miles'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Miles
              </button>
              <button
                onClick={() => setUnit('kilometers')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'kilometers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Kilometers
              </button>
            </div>
          </div>

          {/* Increment Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Segment Increment
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIncrement(0.25)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  increment === 0.25
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => setIncrement(0.5)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  increment === 0.5
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Half
              </button>
              <button
                onClick={() => setIncrement(1)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  increment === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Full
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Settings are saved locally and will persist when you reload the page or share this analysis.
        </p>
      </div>

      {/* AI Coaching Insights */}
      {analysis.aiCoachingInsights && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Coaching Insights
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalized strategy and recommendations
              </p>
            </div>
          </div>
          <div 
            className="ai-insights-content"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(analysis.aiCoachingInsights, {
                ALLOWED_TAGS: ['h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br'],
                ALLOWED_ATTR: []
              })
            }}
          />
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Distance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.totalDistance.toFixed(2)} {unit === 'miles' ? 'mi' : 'km'}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Elevation Gain</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            +{Math.round(analysis.totalElevationGain)} ft
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Elevation Loss</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            -{Math.round(analysis.totalElevationLoss)} ft
          </p>
        </div>
      </div>

      {/* Elevation Chart - Full Width */}
      {analysis.points && analysis.points.length > 0 && (
        <div ref={chartContainerRef}>
          <ElevationChart 
            points={analysis.points} 
            segments={analysis.segments}
            hoveredSegmentIndex={hoveredSegmentIndex}
            onHoverPoint={handleChartHover}
          />
        </div>
      )}

      {/* Two Column Layout: Map and Mile-by-Mile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Map - Left Column (Sticky) */}
        {analysis.points && analysis.points.length > 0 && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Route Map
            </h2>
            <div ref={mapContainerRef}>
              <RouteMap
                points={analysis.points}
                segments={analysis.segments}
                hoveredSegmentIndex={hoveredSegmentIndex}
                hoveredPoint={hoveredPoint}
              />
            </div>
          </div>
        )}

        {/* Segment Details - Right Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {unit === 'miles' ? 'Mile-by-Mile' : 'Kilometer-by-Kilometer'} Breakdown
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analysis.segments.map((segment, index) => (
              <div
                key={index}
                className={`p-4 transition-colors cursor-pointer ${
                  hoveredSegmentIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onMouseEnter={() => {
                  setManualHoveredSegmentIndex(index);
                  setHoveredPoint(null);
                }}
                onMouseLeave={() => {
                  setManualHoveredSegmentIndex(null);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {unit === 'miles' ? 'Mile' : 'Km'} {segment.startMile.toFixed(increment >= 1 ? 1 : 2)} - {segment.endMile.toFixed(increment >= 1 ? 1 : 2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {segment.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      Math.abs(segment.avgGrade) < 1
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        : segment.avgGrade > 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {segment.avgGrade > 0 ? '+' : ''}
                    {segment.avgGrade.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Gain: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(segment.elevationGain)} ft
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Loss: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(segment.elevationLoss)} ft
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default RouteAnalysisDisplay;
