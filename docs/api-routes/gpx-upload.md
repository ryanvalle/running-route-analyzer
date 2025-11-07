# POST /api/gpx-upload

## Overview
Uploads and parses GPX files to extract GPS coordinates and elevation data.

## File Location
`app/api/gpx-upload/route.ts`

## Request

### Method
`POST`

### Headers
```
Content-Type: multipart/form-data
```

### Body Parameters
Form data with single file field:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | `File` | Yes | GPX file (must have .gpx extension) |

### Example Request (curl)
```bash
curl -X POST http://localhost:3000/api/gpx-upload \
  -F "file=@/path/to/route.gpx"
```

### Example Request (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/gpx-upload', {
  method: 'POST',
  body: formData,
});
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "points": [
    {
      "lat": 37.7749,
      "lng": -122.4194,
      "elevation": 100.5,
      "distance": 0
    },
    {
      "lat": 37.7750,
      "lng": -122.4195,
      "elevation": 102.3,
      "distance": 15.2
    }
  ],
  "totalPoints": 1234
}
```

### Error Responses

**400 Bad Request** - No file provided
```json
{
  "error": "No file provided"
}
```

**400 Bad Request** - Invalid file type
```json
{
  "error": "File must be a .gpx file"
}
```

**400 Bad Request** - Parse failure
```json
{
  "error": "Failed to parse GPX file"
}
```

**400 Bad Request** - No track data
```json
{
  "error": "No track data found in GPX file"
}
```

**400 Bad Request** - No valid GPS data
```json
{
  "error": "No valid GPS data with elevation found in GPX file"
}
```

**500 Internal Server Error** - Processing error
```json
{
  "error": "Failed to process GPX file"
}
```

## Dependencies

### External Dependencies
```typescript
import GPX from 'gpx-parser-builder';
```

**Package**: `gpx-parser-builder` v1.1.1
**Purpose**: Parse GPX XML files into JavaScript objects

### Type Definitions
```typescript
interface GPXPoint {
  $: {
    lat: string | number;
    lon: string | number;
  };
  ele?: string | number;
}

interface GPXTrackSegment {
  trkpt: GPXPoint[];
}

interface GPXTrack {
  trkseg: GPXTrackSegment[];
}

interface GPXData {
  trk: GPXTrack[];
}
```

## Processing Flow

1. **Extract File**: Get file from FormData
2. **Validate Extension**: Check file ends with `.gpx`
3. **Read Text**: Convert file to text string
4. **Parse GPX**: Parse XML using gpx-parser-builder
5. **Extract Tracks**: Iterate through all tracks and segments
6. **Process Points**: For each track point:
   - Extract lat, lon, elevation
   - Calculate distance from previous point
   - Accumulate total distance
7. **Validate Data**: Ensure at least one valid point with elevation
8. **Return Points**: Send array of RoutePoint objects

## GPX File Structure

### Standard GPX Format
```xml
<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <name>Morning Run</name>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100.5</ele>
        <time>2024-11-01T08:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>102.3</ele>
        <time>2024-11-01T08:00:15Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

### Required Fields
- `<trkpt lat="..." lon="...">` - GPS coordinates
- `<ele>` - Elevation in meters

### Optional Fields (Ignored)
- `<time>` - Timestamp
- `<name>` - Track name
- `<desc>` - Description
- `<extensions>` - Custom data

## Helper Functions

### `parseNumber(value: string | number): number`
**Purpose**: Convert string or number to float

**Implementation**:
```typescript
function parseNumber(value: string | number): number {
  return parseFloat(String(value));
}
```

### `calculateDistance(lat1, lon1, lat2, lon2): number`
**Purpose**: Calculate distance between two GPS coordinates using Haversine formula

**Returns**: Distance in meters

**Implementation**:
```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

**Accuracy**: ~0.5% error (sufficient for running routes)

## Validation Rules

### File Validation
- Must have .gpx extension
- Must be valid XML
- Must parse successfully

### Data Validation
- Must have at least one track (`<trk>`)
- Track must have at least one segment (`<trkseg>`)
- Segment must have at least one point (`<trkpt>`)
- Point must have valid lat, lon, and elevation

### Coordinate Validation
- Latitude: -90 to 90
- Longitude: -180 to 180
- Elevation: Any number (meters)

## Performance Considerations

### File Size Limits
- No explicit limit in code
- Typical GPX file: 100 KB - 1 MB
- Large files (10k+ points): 2-5 MB
- Processing time: O(n) where n = number of points

### Memory Usage
- Entire file loaded into memory
- Points array stored in memory
- Typical: 1-10 MB for file + points

### Optimization
- Could add streaming parser for very large files
- Could add point decimation for files with >5000 points
- Currently handles typical files efficiently

## Common GPX Sources

### Compatible Devices/Apps
- ✅ Garmin watches (Fenix, Forerunner, etc.)
- ✅ Suunto watches
- ✅ Polar watches
- ✅ Apple Watch (via third-party apps)
- ✅ Strava (export GPX)
- ✅ RunKeeper (export GPX)
- ✅ MapMyRun (export GPX)
- ✅ Komoot
- ✅ RideWithGPS

### Known Issues
- Some apps export GPX without elevation data (will fail validation)
- Some older formats may not parse correctly
- Route files (without track points) are not supported

## Testing

### Manual Testing

**Valid GPX:**
```bash
# Create test file
echo '<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100</ele>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>105</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>' > test.gpx

# Upload
curl -X POST http://localhost:3000/api/gpx-upload \
  -F "file=@test.gpx"
```

**Error Cases:**
```bash
# Wrong extension
curl -X POST http://localhost:3000/api/gpx-upload \
  -F "file=@test.txt"

# No file
curl -X POST http://localhost:3000/api/gpx-upload
```

### Unit Tests
Currently no unit tests exist. Consider adding:
- Distance calculation tests
- Parse number tests
- Invalid GPX handling
- Edge cases (single point, missing elevation)

## Related Documentation

- [Analyze Route](./analyze.md) - Next step after upload
- [FileUpload Component](../components/FileUpload.md) - Client component
- [Overview](../overview.md) - Application overview
