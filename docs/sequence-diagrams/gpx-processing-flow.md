# GPX File Processing - Detailed Flow

This diagram shows the detailed GPX file parsing and validation process.

```mermaid
sequenceDiagram
    participant Client
    participant API as /api/gpx-upload
    participant GPX as GPX.parse()
    participant Validator
    participant Haversine
    participant Cache

    Client->>API: POST FormData with GPX file
    API->>API: Extract file from FormData
    
    API->>Validator: Validate file exists
    alt No File
        Validator-->>API: Validation failed
        API-->>Client: 400: "No file provided"
    end
    
    API->>Validator: Check .gpx extension
    alt Not .gpx
        Validator-->>API: Validation failed
        API-->>Client: 400: "File must be a .gpx file"
    end
    
    API->>API: Read file as text
    API->>GPX: GPX.parse(xmlText)
    
    GPX->>GPX: Parse XML structure
    GPX->>GPX: Validate GPX schema
    
    alt Parse Failed
        GPX-->>API: Null or error
        API-->>Client: 400: "Failed to parse GPX file"
    end
    
    GPX-->>API: Parsed GPX object
    
    API->>API: Check gpx.trk exists
    alt No Tracks
        API-->>Client: 400: "No track data found in GPX file"
    end
    
    API->>API: Initialize: allPoints = [], totalDistance = 0
    
    loop For each track in gpx.trk
        loop For each segment in track.trkseg
            loop For each point in segment.trkpt
                API->>API: Extract lat, lon, elevation
                
                API->>Validator: Validate coordinates
                Note over Validator: lat: -90 to 90<br/>lon: -180 to 180<br/>elevation: exists
                
                alt Invalid Coordinates
                    Validator-->>API: Skip point
                else Valid Coordinates
                    alt Not First Point
                        API->>Haversine: Calculate distance<br/>from previous point
                        Note over Haversine: R = 6371e3 (Earth radius)<br/>φ = lat * π/180<br/>Δφ = (lat2-lat1) * π/180<br/>Δλ = (lon2-lon1) * π/180<br/>a = sin²(Δφ/2) + cos(φ1)·cos(φ2)·sin²(Δλ/2)<br/>c = 2·atan2(√a, √(1-a))<br/>distance = R · c
                        Haversine-->>API: Distance in meters
                        API->>API: totalDistance += distance
                    end
                    
                    API->>API: allPoints.push({<br/>  lat, lng, elevation,<br/>  distance: totalDistance<br/>})
                end
            end
        end
    end
    
    API->>Validator: Check allPoints.length > 0
    alt No Valid Points
        API-->>Client: 400: "No valid GPS data with elevation found"
    end
    
    API->>API: Calculate elevation range
    Note over API: minElev = Math.min(...elevations)<br/>maxElev = Math.max(...elevations)
    
    API->>API: Log debug info
    Note over API: console.log("Elevation range:", minElev, maxElev)<br/>console.log("Total points:", allPoints.length)<br/>console.log("Total distance:", totalDistance)
    
    API-->>Client: 200: {<br/>  success: true,<br/>  points: allPoints,<br/>  totalPoints: allPoints.length<br/>}
```

## GPX XML Structure

### Standard Format
```xml
<?xml version="1.0"?>
<gpx version="1.1" creator="GPS Device">
  <metadata>
    <name>Morning Run</name>
    <time>2024-11-01T08:00:00Z</time>
  </metadata>
  <trk>
    <name>Track 1</name>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100.5</ele>
        <time>2024-11-01T08:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>102.3</ele>
        <time>2024-11-01T08:00:15Z</time>
      </trkpt>
      <!-- More points... -->
    </trkseg>
  </trk>
</gpx>
```

## Haversine Formula Breakdown

### Purpose
Calculate great-circle distance between two GPS coordinates on Earth's surface.

### Variables
- `R` = Earth's radius (6,371,000 meters)
- `φ1, φ2` = Latitude in radians
- `λ1, λ2` = Longitude in radians
- `Δφ` = Difference in latitude
- `Δλ` = Difference in longitude

### Formula
```
a = sin²(Δφ/2) + cos(φ1) · cos(φ2) · sin²(Δλ/2)
c = 2 · atan2(√a, √(1-a))
distance = R · c
```

### Accuracy
- Error: ~0.5% for typical running distances
- Assumes spherical Earth
- Good enough for route analysis

## Validation Rules

### File Level
- Must exist in FormData
- Must have `.gpx` extension
- Must be valid XML

### Structure Level
- Must have `<gpx>` root element
- Must have at least one `<trk>` (track)
- Track must have at least one `<trkseg>` (segment)
- Segment must have at least one `<trkpt>` (point)

### Point Level
- Must have `lat` attribute (-90 to 90)
- Must have `lon` attribute (-180 to 180)
- Must have `<ele>` child element (elevation)
- All values must be valid numbers

## Data Extraction

### From XML Attributes
```typescript
const lat = parseFloat(point.$.lat);
const lng = parseFloat(point.$.lon);
```

### From XML Child Elements
```typescript
const elevation = parseFloat(point.ele);
```

### Optional Fields (Ignored)
- `<time>` - Timestamp
- `<name>` - Point name
- `<desc>` - Description
- `<extensions>` - Custom data

## Error Recovery

### Skip Invalid Points
```typescript
if (isNaN(lat) || isNaN(lng)) continue;
if (elevation === undefined || isNaN(elevation)) continue;
```

### Continue Processing
- Invalid points are skipped
- Processing continues with next point
- Only fails if no valid points found

## Performance

### Typical Files
- Points: 500-2000
- Processing time: 50-200ms
- Memory: 1-5 MB

### Large Files
- Points: 5000+
- Processing time: 200-500ms
- Memory: 5-20 MB

### Optimization Opportunities
- Stream parsing for huge files
- Worker thread for parsing
- Point decimation for very dense data

## Common GPX Sources

### Compatible
✅ Garmin devices (.gpx export)  
✅ Suunto watches (.gpx export)  
✅ Polar devices (.gpx export)  
✅ Strava (activity export)  
✅ RunKeeper (activity export)  
✅ MapMyRun (activity export)  

### Issues
⚠️ Some apps export without elevation  
⚠️ Route files vs track files (different structure)  
⚠️ Older GPX 1.0 format may have differences  

## Related Diagrams

- [GPX Upload Flow](./gpx-upload-flow.md) - Complete user flow
- [Route Analysis Flow](./route-analysis-flow.md) - What happens with points
