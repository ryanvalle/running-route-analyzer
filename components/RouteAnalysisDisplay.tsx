'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { RouteAnalysis } from '@/types';

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
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);

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

      {/* Route Map */}
      {analysis.points && analysis.points.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            Route Map
          </h2>
          <RouteMap
            points={analysis.points}
            segments={analysis.segments}
            hoveredSegmentIndex={hoveredSegmentIndex}
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

      {/* Segment Details */}
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
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredSegmentIndex(index)}
              onMouseLeave={() => setHoveredSegmentIndex(null)}
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
  );
}
