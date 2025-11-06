# TypeScript Types Documentation

## Overview
Shared TypeScript type definitions used throughout the application.

## File Location
`types/index.ts`

## Type Definitions

### `DistanceUnit`
```typescript
export type DistanceUnit = 'miles' | 'kilometers';
```

**Purpose**: Display unit for distances

**Used In**:
- RouteAnalysis
- API routes
- Components

### `SegmentIncrement`
```typescript
export type SegmentIncrement = 0.25 | 0.5 | 1;
```

**Purpose**: Segment size for route breakdown

**Values**:
- `0.25` - Quarter mile/km segments
- `0.5` - Half mile/km segments
- `1` - Full mile/km segments

**Used In**:
- RouteAnalysis
- API routes
- RouteAnalysisDisplay settings

### `RoutePoint`
```typescript
export interface RoutePoint {
  lat: number;        // Latitude (-90 to 90)
  lng: number;        // Longitude (-180 to 180)
  elevation: number;  // Elevation in meters
  distance: number;   // Cumulative distance in meters
}
```

**Purpose**: GPS point with elevation data

**Used In**:
- GPX parsing
- Strava API responses
- Route analysis
- Map/chart components

### `RouteSegment`
```typescript
export interface RouteSegment {
  startMile: number;      // Segment start distance
  endMile: number;        // Segment end distance
  elevationGain: number;  // Elevation gain in feet
  elevationLoss: number;  // Elevation loss in feet
  avgGrade: number;       // Average grade percentage
  description: string;    // Terrain description
}
```

**Purpose**: Mile-by-mile or km-by-km segment data

**Field Details**:
- `startMile/endMile`: In selected unit (miles or kilometers)
- `elevationGain/Loss`: Always in feet (converted from meters)
- `avgGrade`: Percentage (-10% to +10% typical)
- `description`: e.g., "Gentle climb", "Steep descent", "Relatively flat"

**Used In**:
- RouteAnalysis
- Segment table display
- Elevation chart
- Map markers

### `RouteAnalysis`
```typescript
export interface RouteAnalysis {
  totalDistance: number;           // In selected unit
  totalElevationGain: number;      // In feet
  totalElevationLoss: number;      // In feet
  segments: RouteSegment[];        // Array of segments
  summary: string;                 // Natural language summary
  points?: RoutePoint[];           // Optional full point data
  aiCoachingInsights?: string;     // Optional AI insights (HTML)
  unit?: DistanceUnit;             // Unit used
  increment?: SegmentIncrement;    // Increment used
}
```

**Purpose**: Complete route analysis result

**Optional Fields**:
- `points`: Included for map/chart rendering
- `aiCoachingInsights`: Only present if OpenAI configured
- `unit/increment`: Metadata about analysis settings

**Used In**:
- API responses
- Component props
- Email reports

### `LatLng`
```typescript
export interface LatLng {
  lat: number;  // Latitude
  lng: number;  // Longitude
}
```

**Purpose**: Simple lat/lng coordinate pair

**Used In**:
- Map components
- Coordinate utilities

## Type Usage Examples

### Creating RoutePoints
```typescript
const points: RoutePoint[] = [
  {
    lat: 37.7749,
    lng: -122.4194,
    elevation: 100,
    distance: 0
  },
  {
    lat: 37.7750,
    lng: -122.4195,
    elevation: 105,
    distance: 15
  }
];
```

### Using RouteAnalysis
```typescript
const analysis: RouteAnalysis = {
  totalDistance: 5.23,
  totalElevationGain: 450,
  totalElevationLoss: 420,
  segments: [
    {
      startMile: 0,
      endMile: 1,
      elevationGain: 85,
      elevationLoss: 20,
      avgGrade: 1.2,
      description: "Gentle climb"
    }
  ],
  summary: "The first 3 miles will be relatively flat.",
  unit: 'miles',
  increment: 1
};
```

### Type Guards
```typescript
function isRoutePoint(obj: any): obj is RoutePoint {
  return (
    typeof obj.lat === 'number' &&
    typeof obj.lng === 'number' &&
    typeof obj.elevation === 'number' &&
    typeof obj.distance === 'number'
  );
}
```

## Import Paths

```typescript
import type { 
  RoutePoint,
  RouteSegment,
  RouteAnalysis,
  DistanceUnit,
  SegmentIncrement,
  LatLng
} from '@/types';
```

## Type Safety

### API Route Validation
```typescript
const validPoints = points.every(
  (p: unknown): p is RoutePoint => {
    const point = p as RoutePoint;
    return (
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      typeof point.elevation === 'number' &&
      typeof point.distance === 'number'
    );
  }
);
```

### Component Props
```typescript
interface ComponentProps {
  analysis: RouteAnalysis;    // Required
  onUpdate?: () => void;       // Optional
}
```

## Related Documentation

- [API Routes](./api-routes/) - Type usage in endpoints
- [Components](./components/) - Type usage in components
- [Lib Utilities](./lib/) - Type usage in utilities
