'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RouteAnalysisDisplay from '@/components/RouteAnalysisDisplay';
import { RouteAnalysis, RoutePoint, DistanceUnit, SegmentIncrement } from '@/types';
import { analyzeRoute } from '@/lib/routeAnalysis';

interface PageProps {
  params: Promise<{
    stravaUser: string;
    activityId: string;
  }>;
}

// Interface for the API response
interface ActivityData {
  success: boolean;
  points: RoutePoint[];
  activityName?: string;
  athleteId?: number;
  analysis: RouteAnalysis;
  cached?: boolean;
  demo?: boolean;
  authRequired?: boolean;
}

export default function AnalysisPage({ params }: PageProps) {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stravaUser, setStravaUser] = useState<string>('');
  const [activityId, setActivityId] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get unit and increment from URL params or localStorage
  const [displayAnalysis, setDisplayAnalysis] = useState<RouteAnalysis | null>(null);

  useEffect(() => {
    params.then(({ stravaUser: user, activityId: id }) => {
      setStravaUser(user);
      setActivityId(id);
    });
  }, [params]);

  useEffect(() => {
    if (!activityId) return;

    // Validate activity ID
    if (!/^\d+$/.test(activityId)) {
      setError('Invalid activity ID');
      setLoading(false);
      return;
    }

    // Fetch activity data from our cached API endpoint
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/strava/activity/${activityId}`);
        const data: ActivityData = await response.json();

        if (!response.ok) {
          if (data.authRequired) {
            setError('Authentication required. Redirecting to login...');
            setTimeout(() => {
              router.push('/');
            }, 2000);
            return;
          }
          throw new Error('Failed to fetch activity data');
        }

        // Verify the strava user matches (if not demo)
        if (data.athleteId && data.athleteId !== 0 && data.athleteId.toString() !== stravaUser) {
          setError('Activity does not belong to this user');
          setLoading(false);
          return;
        }

        setActivityData(data);
        
        // Get unit and increment from URL params or localStorage
        let unit: DistanceUnit = 'miles';
        let increment: SegmentIncrement = 1;
        
        const urlUnit = searchParams.get('unit');
        const urlIncrement = searchParams.get('increment');
        
        if (urlUnit === 'miles' || urlUnit === 'kilometers') {
          unit = urlUnit;
        } else if (typeof window !== 'undefined') {
          const savedUnit = localStorage.getItem('routeAnalyzerUnit');
          if (savedUnit === 'miles' || savedUnit === 'kilometers') {
            unit = savedUnit;
          }
        }
        
        if (urlIncrement) {
          const parsed = parseFloat(urlIncrement);
          if (parsed === 0.25 || parsed === 0.5 || parsed === 1) {
            increment = parsed as SegmentIncrement;
          }
        } else if (typeof window !== 'undefined') {
          const savedIncrement = localStorage.getItem('routeAnalyzerIncrement');
          if (savedIncrement) {
            const parsed = parseFloat(savedIncrement);
            if (parsed === 0.25 || parsed === 0.5 || parsed === 1) {
              increment = parsed as SegmentIncrement;
            }
          }
        }
        
        // Recompute analysis with user's preferred settings if needed
        if (data.analysis && data.points && (unit !== data.analysis.unit || increment !== data.analysis.increment)) {
          const recomputed = analyzeRoute(data.points, unit, increment);
          setDisplayAnalysis({
            ...recomputed,
            points: data.points,
            aiCoachingInsights: data.analysis.aiCoachingInsights,
          });
        } else {
          setDisplayAnalysis(data.analysis);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activityId, stravaUser, router, searchParams]);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading activity data...</p>
        </div>
      </div>
    );
  }

  if (error || !activityData || !displayAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Activity not found'}
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {activityData.activityName || `Activity #${activityId}`}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Strava Activity #{activityId}
            {activityData.cached && (
              <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                (Cached)
              </span>
            )}
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Analyze another route
            </Link>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Share this analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This page is cached for 1 hour and can be shared with others
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                copySuccess
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {copySuccess ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <RouteAnalysisDisplay 
          analysis={displayAnalysis} 
        />
      </div>
    </div>
  );
}
