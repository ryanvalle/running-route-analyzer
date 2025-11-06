# routeAnalysis.ts

## Overview
Core business logic for analyzing running routes, calculating elevation profiles, and generating terrain summaries.

## File Location
`lib/routeAnalysis.ts`

## Main Function

### `analyzeRoute(points, unit, increment): RouteAnalysis`

**Purpose**: Analyze route points and generate mile-by-mile breakdown

**Signature**:
```typescript
function analyzeRoute(
  points: RoutePoint[],
  unit: DistanceUnit = 'miles',
  increment: SegmentIncrement = 1
): RouteAnalysis
```

**Parameters**:
- `points`: Array of GPS points with elevation
- `unit`: Display unit ('miles' or 'kilometers')
- `increment`: Segment size (0.25, 0.5, or 1)

**Returns**: RouteAnalysis object with:
- Total distance
- Total elevation gain/loss
- Segment breakdowns
- Natural language summary
- Unit and increment used

**Algorithm Complexity**: O(n) where n = number of points

## Processing Steps

### 1. Calculate Total Distance
```typescript
const conversionFactor = unit === 'miles' ? METERS_TO_MILES : METERS_TO_KILOMETERS;
const totalDistance = points[points.length - 1].distance * conversionFactor;
```

### 2. Calculate Total Elevation Changes
```typescript
for (let i = 1; i < points.length; i++) {
  const elevDiff = points[i].elevation - points[i - 1].elevation;
  if (elevDiff > 0) {
    totalElevationGain += elevDiff;
  } else {
    totalElevationLoss += Math.abs(elevDiff);
  }
}
```

Convert meters to feet:
```typescript
totalElevationGain *= FEET_PER_METER;
totalElevationLoss *= FEET_PER_METER;
```

### 3. Create Segments
```typescript
const numSegments = Math.ceil(totalDistance / increment);
```

For each segment:
1. Find points within segment boundaries
2. Calculate elevation gain/loss
3. Compute average grade
4. Generate terrain description

### 4. Generate Summary
Call `generateSummary()` to create natural language description.

## Helper Functions

### `generateSummary(segments, totalDistance, unit): string`

**Purpose**: Generate natural language terrain summary

**Logic**:
- Identifies flat/gentle opening miles
- Notes significant elevation changes
- Mentions specific mile markers for transitions

**Examples**:
- "The first 3 miles will be relatively flat. Expect elevation gain starting at mile 4."
- "This 5.2-mile route has varied terrain."

### `metersToMiles(meters): number`
Converts meters to miles using `METERS_TO_MILES` constant.

### `metersToFeet(meters): number`
Converts meters to feet using `FEET_PER_METER` constant.

## Terrain Descriptions

Based on average grade:

| Grade Range | Description |
|-------------|-------------|
| -0.5% to 0.5% | Relatively flat |
| 0.5% to 1% | Gentle climb |
| 1% to 3% | Moderate climb |
| > 3% | Steep climb |
| -1% to -0.5% | Gentle descent |
| -3% to -1% | Moderate descent |
| < -3% | Steep descent |

## Grade Calculation

```typescript
const netElevChange = (endElevation - startElevation) * FEET_PER_METER;
const distanceInFeet = distanceInMeters * FEET_PER_METER;
const avgGrade = (netElevChange / distanceInFeet) * 100;
```

## Segment Optimization

Uses running index to avoid rescanning points:
```typescript
let currentPointIndex = 0;

for (let i = 0; i < numSegments; i++) {
  // Start from previous segment's ending point
  let j = currentPointIndex;
  
  // Skip points before this segment
  while (j < points.length && points[j].distance < startMile) {
    j++;
  }
  
  currentPointIndex = j; // Update for next iteration
}
```

**Benefit**: O(n) instead of O(n*m) where m = number of segments

## Edge Cases

### Empty Points
Returns empty analysis with message "No route data available"

### Single Point
Returns minimal analysis with zero distance

### Missing Elevation
Should be validated before calling (in API route)

## Testing

### Manual Testing
```typescript
const points = [
  { lat: 37.7749, lng: -122.4194, elevation: 100, distance: 0 },
  { lat: 37.7750, lng: -122.4195, elevation: 150, distance: 1609 }
];

const analysis = analyzeRoute(points, 'miles', 1);
// analysis.totalDistance = 1.0 miles
// analysis.totalElevationGain = 164.04 ft (50m * 3.28084)
```

### Unit Tests
Currently no tests exist. Consider adding:
- Distance conversion tests
- Elevation calculation tests
- Segment boundary tests
- Grade calculation tests
- Summary generation tests

## Dependencies

### Internal
```typescript
import { RouteAnalysis, RoutePoint, RouteSegment, DistanceUnit, SegmentIncrement } from '@/types';
import { METERS_TO_MILES, METERS_TO_KILOMETERS, FEET_PER_METER } from './constants';
```

## Used By

- `POST /api/analyze` - Main analysis endpoint
- `RouteAnalysisDisplay` component (for re-analysis with different settings)

## Related Documentation

- [Constants](./constants.md)
- [Types](../types.md)
- [Analyze API](../api-routes/analyze.md)
