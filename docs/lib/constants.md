# constants.ts

## Overview
Unit conversion constants used throughout the application.

## File Location
`lib/constants.ts`

## Constants

### `METERS_TO_MILES`
```typescript
export const METERS_TO_MILES = 0.000621371;
```

**Purpose**: Convert meters to miles

**Usage**:
```typescript
const miles = meters * METERS_TO_MILES;
```

**Precision**: 6 decimal places

### `METERS_TO_KILOMETERS`
```typescript
export const METERS_TO_KILOMETERS = 0.001;
```

**Purpose**: Convert meters to kilometers

**Usage**:
```typescript
const km = meters * METERS_TO_KILOMETERS;
```

### `FEET_PER_METER`
```typescript
export const FEET_PER_METER = 3.28084;
```

**Purpose**: Convert meters to feet (for elevation)

**Usage**:
```typescript
const feet = meters * FEET_PER_METER;
```

**Precision**: 5 decimal places

## Usage Examples

### Distance Conversion
```typescript
import { METERS_TO_MILES } from '@/lib/constants';

const distanceMeters = 5000;
const distanceMiles = distanceMeters * METERS_TO_MILES; // 3.10686 miles
```

### Elevation Conversion
```typescript
import { FEET_PER_METER } from '@/lib/constants';

const elevationMeters = 100;
const elevationFeet = elevationMeters * FEET_PER_METER; // 328.084 feet
```

## Used By

- `lib/routeAnalysis.ts`
- `components/RouteAnalysisDisplay.tsx`
- `components/ElevationChart.tsx`

## Related Documentation

- [Route Analysis](./routeAnalysis.md)
- [Types](../types.md)
