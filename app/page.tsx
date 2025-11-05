'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StravaInput from '@/components/StravaInput';
import FileUpload from '@/components/FileUpload';
import RouteAnalysisDisplay from '@/components/RouteAnalysisDisplay';
import { RoutePoint, RouteAnalysis } from '@/types';
import { METERS_TO_MILES, FEET_PER_METER } from '@/lib/constants';

function HomeContent() {
  const searchParams = useSearchParams();
  const [debugMode, setDebugMode] = useState(false);
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for debug parameter
  useEffect(() => {
    setDebugMode(searchParams.get('debug') === 'true');
  }, [searchParams]);

  const handleRouteData = async (points: RoutePoint[]) => {
    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze route');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze route');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Running Route Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Analyze your running routes from Strava or FIT files
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                From Strava Activity
              </h2>
              <StravaInput onFetch={handleRouteData} />
            </div>

            {debugMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                      OR
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Upload FIT File
                  </h2>
                  <FileUpload onUpload={handleRouteData} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {analyzing && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing route...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Debug Information */}
        {debugMode && analysis && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              🐛 Debug Information
            </h2>
            <div className="space-y-4 text-sm font-mono">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analysis Object:</h3>
                <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                  {JSON.stringify({
                    totalDistance: analysis.totalDistance,
                    totalElevationGain: analysis.totalElevationGain,
                    totalElevationLoss: analysis.totalElevationLoss,
                    segmentCount: analysis.segments?.length || 0,
                    pointCount: analysis.points?.length || 0,
                  }, null, 2)}
                </pre>
              </div>
              
              {analysis.points && analysis.points.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sample Points (first 10) - RAW DATA:</h3>
                  <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(analysis.points.slice(0, 10).map((p, i) => ({
                      index: i,
                      distance: `${p.distance.toFixed(2)}m`,
                      elevation: `${p.elevation.toFixed(2)}m`,
                      lat: p.lat.toFixed(6),
                      lng: p.lng.toFixed(6),
                    })), null, 2)}
                  </pre>
                </div>
              )}
              
              {analysis.points && analysis.points.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chart Points (first 10) - USED FOR RENDERING:</h3>
                  <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(analysis.points.slice(0, 10).map((p, i) => ({
                      index: i,
                      distance: `${(p.distance * METERS_TO_MILES).toFixed(4)} miles`,
                      elevation: `${(p.elevation * FEET_PER_METER).toFixed(2)} ft`,
                      rawDistance: `${p.distance.toFixed(2)}m`,
                      rawElevation: `${p.elevation.toFixed(2)}m`,
                    })), null, 2)}
                  </pre>
                </div>
              )}
              
              {analysis.points && analysis.points.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Elevation Statistics:</h3>
                  <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify({
                      minElevation: `${Math.min(...analysis.points.map(p => p.elevation)).toFixed(2)}m`,
                      maxElevation: `${Math.max(...analysis.points.map(p => p.elevation)).toFixed(2)}m`,
                      elevationRange: `${(Math.max(...analysis.points.map(p => p.elevation)) - Math.min(...analysis.points.map(p => p.elevation))).toFixed(2)}m`,
                      totalPoints: analysis.points.length,
                    }, null, 2)}
                  </pre>
                </div>
              )}
              
              {analysis.segments && analysis.segments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Segments (first 3):</h3>
                  <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(analysis.segments.slice(0, 3).map(s => ({
                      miles: `${s.startMile.toFixed(1)}-${s.endMile.toFixed(1)}`,
                      gain: `${s.elevationGain.toFixed(1)}ft`,
                      loss: `${s.elevationLoss.toFixed(1)}ft`,
                      grade: `${s.avgGrade.toFixed(1)}%`,
                      description: s.description,
                    })), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !analyzing && (
          <RouteAnalysisDisplay analysis={analysis} />
        )}

        {/* Info Section */}
        {!analysis && !analyzing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              How it works
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Enter a Strava activity URL or select from the five recent activities</li>
              <li>• The app will analyze the route elevation profile</li>
              <li>• Get a detailed breakdown of terrain changes mile by mile</li>
              <li>• See expected elevation gains and losses for each segment</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
