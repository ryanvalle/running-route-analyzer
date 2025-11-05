'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { RouteAnalysis, RoutePoint } from '@/types';
import ElevationChart from './ElevationChart';
import { METERS_TO_MILES } from '@/lib/constants';

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
}

export default function RouteAnalysisDisplay({ analysis }: RouteAnalysisDisplayProps) {
  const [manualHoveredSegmentIndex, setManualHoveredSegmentIndex] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<RoutePoint | null>(null);

  // Calculate the segment index based on hovered point - memoized to avoid recalculation
  const hoveredSegmentFromPoint = useMemo(() => {
    if (!hoveredPoint || !analysis.segments) return -1;
    
    const distance = hoveredPoint.distance * METERS_TO_MILES;
    return analysis.segments.findIndex(segment => 
      distance >= segment.startMile && distance < segment.endMile
    );
  }, [hoveredPoint, analysis.segments]);
  
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
            className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
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
            {analysis.totalDistance.toFixed(2)} mi
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
        <ElevationChart 
          points={analysis.points} 
          segments={analysis.segments}
          hoveredSegmentIndex={hoveredSegmentIndex}
          onHoverPoint={handleChartHover}
        />
      )}

      {/* Two Column Layout: Map and Mile-by-Mile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Map - Left Column (Sticky) */}
        {analysis.points && analysis.points.length > 0 && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Route Map
            </h2>
            <RouteMap
              points={analysis.points}
              segments={analysis.segments}
              hoveredSegmentIndex={hoveredSegmentIndex}
              hoveredPoint={hoveredPoint}
            />
          </div>
        )}

        {/* Segment Details - Right Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mile-by-Mile Breakdown
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
                      Mile {segment.startMile.toFixed(1)} - {segment.endMile.toFixed(1)}
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
}
