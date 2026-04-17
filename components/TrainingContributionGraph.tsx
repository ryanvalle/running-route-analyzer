'use client';

import { useState, useEffect, useMemo } from 'react';

interface Activity {
  id: number;
  name: string;
  distance: number;
  start_date: string;
  elapsed_time: number;
  type: string;
  workout_type: number | null;
}

type DateRangePreset = '30d' | '90d' | '6m' | '1y';

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '6m', label: '6mo' },
  { value: '1y', label: '1yr' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Training-time thresholds (seconds) for intensity levels 1–4.
// Level 0 is anything not covered (i.e. 0 seconds / no activity).
const INTENSITY_THRESHOLDS = [30 * 60, 60 * 60, 90 * 60] as const; // 30 min, 60 min, 90 min
const INTENSITY_LABELS = ['None', '<30m', '30–60m', '60–90m', '90m+'] as const;
const CELL_SIZE = 13;
const GAP = 3;
const CELL_STEP = CELL_SIZE + GAP;
// Width reserved for the day-label column
const DAY_LABEL_WIDTH = 28;

// Intensity → Tailwind color classes (light and dark mode).
// Must be complete static strings so Tailwind v4 includes them in the bundle.
const CELL_COLORS = [
  'bg-gray-100 dark:bg-gray-700',          // 0 – no training
  'bg-blue-100 dark:bg-blue-900/60',       // 1 – < 30 min
  'bg-blue-300 dark:bg-blue-700',          // 2 – 30–60 min
  'bg-blue-500 dark:bg-blue-500',          // 3 – 60–90 min
  'bg-blue-700 dark:bg-blue-400',          // 4 – 90+ min
] as const;

function getDateRangeDates(preset: DateRangePreset): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  switch (preset) {
    case '30d':
      start.setDate(start.getDate() - 29);
      break;
    case '90d':
      start.setDate(start.getDate() - 89);
      break;
    case '6m':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function formatTime(seconds: number): string {
  if (seconds === 0) return 'No training';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getIntensityLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0) return 0;
  if (seconds < INTENSITY_THRESHOLDS[0]) return 1;
  if (seconds < INTENSITY_THRESHOLDS[1]) return 2;
  if (seconds < INTENSITY_THRESHOLDS[2]) return 3;
  return 4;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function TrainingContributionGraph() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [preset, setPreset] = useState<DateRangePreset>('90d');
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; seconds: number } | null>(null);

  const { start, end } = useMemo(() => getDateRangeDates(preset), [preset]);

  // Re-fetch when preset changes so we always have enough data for the selected range.
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      try {
        const authRes = await fetch('/api/strava/auth-status');
        const authData = await authRes.json();

        if (!authData.authenticated || !authData.configured) {
          if (!cancelled) setAuthenticated(false);
          return;
        }

        if (!cancelled) setAuthenticated(true);

        // Use Unix timestamp so Strava filters server-side and we stay within per_page.
        const afterTs = Math.floor(start.getTime() / 1000);
        const activitiesRes = await fetch(
          `/api/strava/activities?after=${afterTs}&per_page=200`,
        );

        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          if (data.success && !cancelled) {
            setActivities(data.activities);
          }
        }
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [preset, start]);

  // Build a date → total-seconds map for activities within the current range.
  const dayMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((activity) => {
      const dateStr = activity.start_date.split('T')[0];
      const actDate = new Date(dateStr + 'T00:00:00');
      if (actDate >= start && actDate <= end) {
        map.set(dateStr, (map.get(dateStr) ?? 0) + activity.elapsed_time);
      }
    });
    return map;
  }, [activities, start, end]);

  // Build the flat list of Date objects for the grid, padded to full weeks.
  // The grid always starts on the Sunday of the week that contains `start`.
  const allDays = useMemo(() => {
    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // back to Sunday
    gridStart.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    const cur = new Date(gridStart);

    while (cur <= end || days.length % 7 !== 0) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return days;
  }, [start, end]);

  const numWeeks = allDays.length / 7;

  // Positions (px from left edge of grid) where month labels should appear.
  const monthLabelPositions = useMemo(() => {
    const positions: { left: number; label: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const weekDay = allDays[w * 7];
      if (!weekDay) continue;
      const month = weekDay.getMonth();
      if (month !== lastMonth) {
        positions.push({ left: w * CELL_STEP, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    }

    return positions;
  }, [allDays, numWeeks]);

  // Summary stats
  const stats = useMemo(() => {
    let totalSeconds = 0;
    let activeDays = 0;
    dayMap.forEach((s) => {
      totalSeconds += s;
      activeDays += 1;
    });
    return { totalSeconds, activeDays };
  }, [dayMap]);

  // Don't render anything while checking auth or if not authenticated.
  if (!authenticated) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Training Activity
          </h2>
          {!loading && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {stats.activeDays} active day{stats.activeDays !== 1 ? 's' : ''}&nbsp;·&nbsp;
              {formatTime(stats.totalSeconds)} total
            </p>
          )}
        </div>

        {/* Preset selector */}
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                preset === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hover info bar */}
      <div className="h-5 mb-2 text-sm">
        {hoveredDay ? (
          <span className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(hoveredDay.seconds)}
            </span>
            {' on '}
            {formatFullDate(hoveredDay.date)}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            Hover over a day to see details
          </span>
        )}
      </div>

      {/* Graph */}
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${DAY_LABEL_WIDTH + numWeeks * CELL_STEP}px` }}>
            {/* Month labels */}
            <div
              className="relative mb-1"
              style={{ marginLeft: `${DAY_LABEL_WIDTH + 8}px`, height: '16px' }}
            >
              {monthLabelPositions.map(({ left, label }, i) => (
                <span
                  key={i}
                  className="absolute text-xs text-gray-500 dark:text-gray-400"
                  style={{ left: `${left}px` }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Day labels + cell grid */}
            <div className="flex" style={{ gap: '8px' }}>
              {/* Day-of-week labels (only Mon and Fri visible) */}
              <div
                className="flex flex-col shrink-0"
                style={{ gap: `${GAP}px`, width: `${DAY_LABEL_WIDTH}px` }}
              >
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end"
                    style={{
                      height: `${CELL_SIZE}px`,
                      visibility: i === 1 || i === 5 ? 'visible' : 'hidden',
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Contribution cells */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                  gridAutoFlow: 'column',
                  gridAutoColumns: `${CELL_SIZE}px`,
                  gap: `${GAP}px`,
                }}
              >
                {allDays.map((day, i) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const isInRange = day >= start && day <= end;
                  const seconds = isInRange ? (dayMap.get(dateStr) ?? 0) : 0;
                  const level = isInRange ? getIntensityLevel(seconds) : 0;

                  return (
                    <div
                      key={i}
                      className={`rounded-sm transition-opacity ${CELL_COLORS[level]} ${
                        !isInRange ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:opacity-75'
                      }`}
                      style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                      onMouseEnter={() => isInRange && setHoveredDay({ date: day, seconds })}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          {CELL_COLORS.map((color, i) => (
            <div
              key={i}
              className={`rounded-sm shrink-0 ${color}`}
              style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
            />
          ))}
          <span>More</span>
          <span className="ml-2 text-gray-400 dark:text-gray-500 hidden sm:inline">
            {INTENSITY_LABELS.join('\u00a0·\u00a0')}
          </span>
        </div>
      )}
    </div>
  );
}
