import { RoutePoint, RouteSegment, RouteAnalysis } from '@/types';

/**
 * Mock route points representing a 5-mile route with varied terrain
 * Distance in meters, elevation in meters
 */
export const mockRoutePoints: RoutePoint[] = [
  // Mile 0-1: Relatively flat
  { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
  { lat: 37.7750, lng: -122.4195, elevation: 101, distance: 402 },
  { lat: 37.7751, lng: -122.4196, elevation: 102, distance: 804 },
  { lat: 37.7752, lng: -122.4197, elevation: 103, distance: 1207 },
  { lat: 37.7753, lng: -122.4198, elevation: 104, distance: 1609 }, // End of mile 1
  
  // Mile 1-2: Gentle climb
  { lat: 37.7754, lng: -122.4199, elevation: 108, distance: 2011 },
  { lat: 37.7755, lng: -122.4200, elevation: 112, distance: 2414 },
  { lat: 37.7756, lng: -122.4201, elevation: 116, distance: 2816 },
  { lat: 37.7757, lng: -122.4202, elevation: 120, distance: 3219 }, // End of mile 2
  
  // Mile 2-3: Steep climb
  { lat: 37.7758, lng: -122.4203, elevation: 128, distance: 3621 },
  { lat: 37.7759, lng: -122.4204, elevation: 138, distance: 4023 },
  { lat: 37.7760, lng: -122.4205, elevation: 148, distance: 4426 },
  { lat: 37.7761, lng: -122.4206, elevation: 158, distance: 4828 }, // End of mile 3
  
  // Mile 3-4: Moderate descent
  { lat: 37.7762, lng: -122.4207, elevation: 152, distance: 5230 },
  { lat: 37.7763, lng: -122.4208, elevation: 146, distance: 5633 },
  { lat: 37.7764, lng: -122.4209, elevation: 140, distance: 6035 },
  { lat: 37.7765, lng: -122.4210, elevation: 134, distance: 6437 }, // End of mile 4
  
  // Mile 4-5: Relatively flat
  { lat: 37.7766, lng: -122.4211, elevation: 133, distance: 6840 },
  { lat: 37.7767, lng: -122.4212, elevation: 132, distance: 7242 },
  { lat: 37.7768, lng: -122.4213, elevation: 131, distance: 7645 },
  { lat: 37.7769, lng: -122.4214, elevation: 130, distance: 8047 }, // End of mile 5
];

/**
 * Expected segments from analyzing mockRoutePoints
 */
export const mockSegments: RouteSegment[] = [
  {
    startMile: 0,
    endMile: 1,
    elevationGain: 13.12,
    elevationLoss: 0,
    avgGrade: 0.81,
    description: 'Relatively flat',
  },
  {
    startMile: 1,
    endMile: 2,
    elevationGain: 52.49,
    elevationLoss: 0,
    avgGrade: 3.26,
    description: 'Moderate climb',
  },
  {
    startMile: 2,
    endMile: 3,
    elevationGain: 124.67,
    elevationLoss: 0,
    avgGrade: 7.74,
    description: 'Steep climb',
  },
  {
    startMile: 3,
    endMile: 4,
    elevationGain: 0,
    elevationLoss: 78.74,
    avgGrade: -4.89,
    description: 'Moderate descent',
  },
  {
    startMile: 4,
    endMile: 5,
    elevationGain: 0,
    elevationLoss: 13.12,
    avgGrade: -0.81,
    description: 'Relatively flat',
  },
];

/**
 * Complete mock route analysis
 */
export const mockAnalysis: RouteAnalysis = {
  totalDistance: 5.0,
  totalElevationGain: 190.29,
  totalElevationLoss: 91.86,
  segments: mockSegments,
  summary: 'The first 1 mile will be relatively flat. Expect elevation gain starting at mile 1.',
  points: mockRoutePoints,
};

/**
 * Mock route with no points (edge case)
 */
export const emptyRoutePoints: RoutePoint[] = [];

/**
 * Mock route with single point (edge case)
 */
export const singlePointRoute: RoutePoint[] = [
  { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
];

/**
 * Mock Strava activity data
 */
export const mockStravaActivity = {
  id: 123456789,
  name: 'Morning Run',
  distance: 8047,
  elapsed_time: 2400,
  type: 'Run',
  start_date: '2024-01-15T06:30:00Z',
  workout_type: null,
  athlete: {
    id: 987654321,
  },
};

/**
 * Mock AI coaching insights
 */
export const mockAICoachingInsights = `
<h3>Pacing Strategy</h3>
<p>Start conservatively in the first mile to warm up properly.</p>
<ul>
<li>Miles 0-1: Easy pace, focus on form</li>
<li>Miles 1-3: Manage effort on climbs, shorter strides</li>
<li>Miles 3-4: Recover on descent, but maintain control</li>
<li>Mile 4-5: Finish strong with good form</li>
</ul>

<h3>Key Considerations</h3>
<p>The steep climb in mile 3 will be challenging. Break it into smaller segments mentally.</p>
`;

/**
 * Mock FIT file buffer data
 */
export const mockFITFileData = new Uint8Array([
  0x0E, 0x10, 0x00, 0x00, // FIT file header
  // ... truncated for brevity, real FIT files are larger
]);
