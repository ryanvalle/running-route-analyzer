'use client';

import { useState, Suspense, useRef } from 'react';
import StravaInput from '@/components/StravaInput';
import FileUpload from '@/components/FileUpload';
import RouteAnalysisDisplay, { RouteAnalysisDisplayRef } from '@/components/RouteAnalysisDisplay';
import EmailReport from '@/components/EmailReport';
import { RoutePoint, RouteAnalysis, DistanceUnit, SegmentIncrement } from '@/types';

function HomeContent() {
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const analysisDisplayRef = useRef<RouteAnalysisDisplayRef>(null);
  const [currentUnit, setCurrentUnit] = useState<DistanceUnit>('miles');
  const [currentIncrement, setCurrentIncrement] = useState<SegmentIncrement>(1);

  const handleRouteData = async (points: RoutePoint[], activityInfo?: { activityId: string; athleteId: string }) => {
    setAnalyzing(true);
    setError(null);

    try {
      // Get saved settings from localStorage if available
      let unit: DistanceUnit = 'miles';
      let increment: SegmentIncrement = 1;
      
      if (typeof window !== 'undefined') {
        const savedUnit = localStorage.getItem('routeAnalyzerUnit');
        const savedIncrement = localStorage.getItem('routeAnalyzerIncrement');
        if (savedUnit === 'miles' || savedUnit === 'kilometers') {
          unit = savedUnit;
        }
        if (savedIncrement) {
          const parsed = parseFloat(savedIncrement);
          if (parsed === 0.25 || parsed === 0.5 || parsed === 1) {
            increment = parsed as SegmentIncrement;
          }
        }
      }
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          points,
          activityId: activityInfo?.activityId,
          unit,
          increment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze route');
      }

      setAnalysis(data.analysis);
      setCurrentUnit(unit);
      setCurrentIncrement(increment);
      
      // Store activity info for shareable link
      if (activityInfo) {
        setActivityId(activityInfo.activityId);
        setAthleteId(activityInfo.athleteId);
      }
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
            Route Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Analyze your routes from Strava or GPX files
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
                Upload GPX File
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
          <RouteAnalysisDisplay ref={analysisDisplayRef} analysis={analysis} />
        )}

        {/* Shareable Link Section */}
        {analysis && !analyzing && activityId && athleteId && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Share Your Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activityId && athleteId 
                    ? 'Your analysis is available at a shareable URL with 1-hour caching (includes your display settings)'
                    : 'Share your analysis via email or shareable link'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <EmailReport 
                  analysis={analysis}
                  analysisDisplayRef={analysisDisplayRef}
                />
                {activityId && athleteId && (
                  <a
                    href={`/analysis/${athleteId}/${activityId}?unit=${currentUnit}&increment=${currentIncrement}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-center"
                  >
                    View Shareable Page →
                  </a>
                )}
              </div>
            </div>
          </div>
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
