# GET /api/gpx-analysis/[gpxId]

## Overview
Retrieves cached GPX analysis data by UUID.

## File Location
`app/api/gpx-analysis/[gpxId]/route.ts`

## Request

### Method
`GET`

### URL Parameters
- `gpxId`: UUID generated during GPX upload

### Example
```
GET /api/gpx-analysis/abc123-def456-ghi789
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "points": [...],
  "analysis": {...}
}
```

### Error Responses

**404 Not Found** - GPX ID not found or expired
```json
{
  "error": "GPX analysis not found or expired"
}
```

## Dependencies

### Internal Dependencies
```typescript
import { cache } from '@/lib/cache';
```

## Cache Details
- Cache key: `gpx:{gpxId}`
- TTL: 1 hour
- Data: `{ points: RoutePoint[], analysis: RouteAnalysis }`

## Testing
```bash
# Get gpxId from upload response, then:
curl http://localhost:3000/api/gpx-analysis/{gpxId}
```

## Related Documentation
- [GPX Upload](./gpx-upload.md)
- [Analyze Route](./analyze.md)
