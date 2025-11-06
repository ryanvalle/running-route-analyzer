# GET /api/strava/activity/[activityId]

## Overview
Fetches specific Strava activity data by ID.

## File Location
`app/api/strava/activity/[activityId]/route.ts`

## Request

### Method
`GET`

### URL Parameters
- `activityId`: Numeric activity ID

### Example
```
GET /api/strava/activity/123456789
```

## Response

Similar to POST /api/strava but uses activity ID from URL instead of parsing from activityUrl parameter.

### Success
```json
{
  "success": true,
  "points": [...],
  "activityId": "123456789",
  "activityName": "Morning Run"
}
```

## Dependencies

Same as [POST /api/strava](./strava.md)

## Testing
```bash
curl http://localhost:3000/api/strava/activity/123456789 \
  -H "Cookie: strava_access_token=..."
```

## Related Documentation
- [Strava Integration](../third-party/strava.md)
- [POST /api/strava](./strava.md)
