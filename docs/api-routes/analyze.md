# POST /api/analyze

## Overview
Analyzes route points to generate elevation profiles, mile-by-mile breakdowns, and optional AI coaching insights.

## File Location
`app/api/analyze/route.ts`

## Request

### Method
`POST`

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `points` | `RoutePoint[]` | Yes | Array of GPS points with elevation data |
| `activityId` | `string \| number` | No | Strava activity ID for caching |
| `unit` | `'miles' \| 'kilometers'` | No | Distance unit (default: 'miles') |
| `increment` | `0.25 \| 0.5 \| 1` | No | Segment increment (default: 1) |
| `isGpxUpload` | `boolean` | No | Whether this is a GPX upload (enables caching) |

### RoutePoint Structure
```typescript
{
  lat: number;        // Latitude (-90 to 90)
  lng: number;        // Longitude (-180 to 180)
  elevation: number;  // Elevation in meters
  distance: number;   // Cumulative distance in meters
}
```

### Example Request
```json
{
  "points": [
    {
      "lat": 37.7749,
      "lng": -122.4194,
      "elevation": 100.0,
      "distance": 0
    },
    {
      "lat": 37.7750,
      "lng": -122.4195,
      "elevation": 105.5,
      "distance": 15.2
    }
  ],
  "unit": "miles",
  "increment": 1,
  "activityId": "123456789"
}
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "analysis": {
    "totalDistance": 5.23,
    "totalElevationGain": 450.5,
    "totalElevationLoss": 420.3,
    "segments": [
      {
        "startMile": 0,
        "endMile": 1,
        "elevationGain": 85.2,
        "elevationLoss": 20.1,
        "avgGrade": 1.2,
        "description": "Gentle climb"
      }
    ],
    "summary": "The first 3 miles will be relatively flat. Expect elevation gain starting at mile 4.",
    "points": [...],
    "aiCoachingInsights": "<h3>Route Overview</h3><p>...</p>",
    "unit": "miles",
    "increment": 1
  },
  "gpxId": "uuid-if-gpx-upload"
}
```

### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Valid route points are required"
}
```

**400 Bad Request** - Invalid point structure
```json
{
  "error": "Invalid point data structure"
}
```

**500 Internal Server Error** - Processing error
```json
{
  "error": "Failed to analyze route"
}
```

## Dependencies

### Environment Variables
- `OPENAI_API_KEY` (optional) - For AI coaching insights

### Internal Dependencies
```typescript
import { analyzeRoute } from '@/lib/routeAnalysis';
import { getAICoachingInsights } from '@/lib/openai';
import { RoutePoint, DistanceUnit, SegmentIncrement } from '@/types';
import { cache } from '@/lib/cache';
```

### External Dependencies
- `crypto.randomUUID()` - For GPX ID generation

## Processing Flow

1. **Validate Input**: Check points array exists and is valid
2. **Validate Point Structure**: Ensure each point has required fields
3. **Parse Parameters**: Extract unit and increment (with defaults)
4. **Analyze Route**: Call `analyzeRoute()` with points and settings
5. **Get AI Insights**: Call `getAICoachingInsights()` if configured
6. **Cache Data**: If GPX upload, generate UUID and cache for 1 hour
7. **Return Response**: Send analysis with optional GPX ID

## Business Logic

### Route Analysis (`analyzeRoute()`)
**Location**: `lib/routeAnalysis.ts`

**Process**:
1. Convert distance from meters to selected unit
2. Calculate total elevation gain and loss
3. Segment route by increment (0.25, 0.5, or 1)
4. For each segment:
   - Find points within segment boundaries
   - Calculate elevation changes
   - Compute average grade
   - Generate terrain description
5. Generate natural language summary

### AI Coaching Insights (`getAICoachingInsights()`)
**Location**: `lib/openai.ts`

**Process**:
1. Check if OpenAI API key configured
2. Check cache for existing insights
3. Build prompt with route data
4. Call OpenAI GPT-4o-mini
5. Cache insights (if activityId provided)
6. Return HTML-formatted insights or null

### Caching Strategy

**GPX Uploads**:
- Cache key: `gpx:{uuid}`
- TTL: 1 hour
- Data: Points and full analysis
- Purpose: Allow retrieval via `/api/gpx-analysis/[gpxId]`

**AI Insights**:
- Cache key: `ai:coaching:{activityId}`
- TTL: 1 hour
- Data: HTML string
- Purpose: Avoid duplicate OpenAI API calls

## Validation Rules

### Points Array
- Must be non-empty array
- Minimum 2 points recommended

### Point Fields
- `lat`: Must be a number (-90 to 90)
- `lng`: Must be a number (-180 to 180)
- `elevation`: Must be a number (meters)
- `distance`: Must be a number (cumulative meters)

### Unit Parameter
- Must be `'miles'` or `'kilometers'`
- Defaults to `'miles'`

### Increment Parameter
- Must be `0.25`, `0.5`, or `1`
- Defaults to `1`

## Performance Considerations

### Request Size
- Large GPX files may have 1000+ points
- Typical request: 10-100 KB
- Maximum recommended: 5000 points

### Processing Time
- Route analysis: 10-50ms
- OpenAI API call: 1-3 seconds (if configured)
- Total: 1-4 seconds typical

### Optimization
- Caching reduces redundant AI calls
- Efficient O(n) algorithm for segmentation
- Parallel processing not needed (fast enough)

## Testing

### Manual Testing

**Basic Route:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"lat": 37.7749, "lng": -122.4194, "elevation": 100, "distance": 0},
      {"lat": 37.7800, "lng": -122.4200, "elevation": 150, "distance": 500}
    ]
  }'
```

**With Unit and Increment:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "points": [...],
    "unit": "kilometers",
    "increment": 0.5
  }'
```

**Error Cases:**
```bash
# Empty points
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"points": []}'

# Missing elevation
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"points": [{"lat": 37.7749, "lng": -122.4194, "distance": 0}]}'
```

### Unit Tests
Currently no unit tests exist. Consider adding:
- Point validation tests
- Different unit conversions
- Different increment values
- Edge cases (single point, identical elevations)

## Common Issues

**"Valid route points are required"**
- Missing `points` parameter
- Empty array
- Not an array

**"Invalid point data structure"**
- Points missing required fields
- Field types incorrect (string instead of number)

**AI insights not appearing**
- `OPENAI_API_KEY` not configured (expected behavior)
- OpenAI API error (check console logs)

## Related Documentation

- [Route Analysis Library](../lib/routeAnalysis.md)
- [OpenAI Integration](../third-party/openai.md)
- [GPX Upload Route](./gpx-upload.md)
- [Strava Route](./strava.md)
