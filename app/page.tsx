'use client';

import { useState } from 'react';
import StravaInput from '@/components/StravaInput';
import FileUpload from '@/components/FileUpload';
import RouteAnalysisDisplay from '@/components/RouteAnalysisDisplay';
import { RoutePoint, RouteAnalysis } from '@/types';

export default function Home() {
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <li>• Enter a Strava activity URL or upload a FIT file from your GPS device</li>
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
