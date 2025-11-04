'use client';

import { useState } from 'react';
import { RoutePoint } from '@/types';

interface StravaInputProps {
  onFetch: (points: RoutePoint[]) => void;
}

export default function StravaInput({ onFetch }: StravaInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strava', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        // For demo purposes, use mock data if available
        if (data.mockData?.points) {
          onFetch(data.mockData.points);
          setError('Using demo data (Strava API not configured)');
          return;
        }
        throw new Error(data.error || 'Failed to fetch activity');
      }

      onFetch(data.points);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Strava activity URL (e.g., https://www.strava.com/activities/123456)"
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
      {error && (
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
      )}
    </div>
  );
}
