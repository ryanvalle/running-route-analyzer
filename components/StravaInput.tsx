'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoutePoint } from '@/types';

interface StravaInputProps {
  onFetch: (points: RoutePoint[], activityInfo?: { activityId: string; athleteId: string }) => void;
}

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  start_date: string;
  elapsed_time: number;
  type: string;
  workout_type: number | null;
}

// Constants for quick select limits
const MAX_RECENT_RUNS = 5;
const MAX_RECENT_RACES = 3;

export default function StravaInput({ onFetch }: StravaInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState<boolean>(true);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch('/api/strava/activities');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/strava/auth-status');
      const data = await response.json();
      setConfigured(data.configured);
      setAuthenticated(data.authenticated && data.configured);
      
      // If authenticated, fetch activities
      if (data.authenticated && data.configured) {
        fetchActivities();
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setAuthenticated(false);
      setConfigured(true);
    }
  }, [fetchActivities]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchActivityByUrl(url);
  };

  const fetchActivityByUrl = async (activityUrl: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strava', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity');
      }

      if (data.demo) {
        setError('Using demo data (Strava API not configured)');
      }

      // Pass activity info for shareable link generation
      const activityInfo = data.activityId && data.athleteId ? {
        activityId: data.activityId.toString(),
        athleteId: data.athleteId.toString(),
      } : undefined;

      onFetch(data.points, activityInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (activityId: number) => {
    const activityUrl = `https://www.strava.com/activities/${activityId}`;
    await fetchActivityByUrl(activityUrl);
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/strava';
  };

  // Show login button if configured but not authenticated
  if (configured && authenticated === false) {
    return (
      <div className="w-full">
        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
        >
          Login to Strava
        </button>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Connect your Strava account to analyze your activities
        </p>
      </div>
    );
  }

  // Show loading state while checking auth
  if (authenticated === null) {
    return (
      <div className="w-full text-center text-gray-600 dark:text-gray-400">
        Checking authentication...
      </div>
    );
  }

  // Get recent runs and races for quick select
  const recentRuns = activities
    .filter((a) => !a.workout_type || a.workout_type === 0)
    .slice(0, MAX_RECENT_RUNS);
  const recentRaces = activities
    .filter((a) => a.workout_type === 1)
    .slice(0, MAX_RECENT_RACES);

  return (
    <div className="w-full space-y-4">
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Strava activity URL or short link (e.g., https://strava.app.link/...)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </form>

      {/* Quick Select Buttons */}
      {!loadingActivities && (recentRuns.length > 0 || recentRaces.length > 0) && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Select:
          </div>
          
          {recentRuns.length > 0 && (
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Recent Runs
              </div>
              <div className="flex flex-wrap gap-2">
                {recentRuns.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleQuickSelect(activity.id)}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {activity.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentRaces.length > 0 && (
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Recent Races
              </div>
              <div className="flex flex-wrap gap-2">
                {recentRaces.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleQuickSelect(activity.id)}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {activity.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loadingActivities && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading activities...
        </div>
      )}

      {error && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
      )}
    </div>
  );
}
