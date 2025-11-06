# GET /api/strava/activities

## Overview
Lists recent running activities from authenticated Strava account.

## File Location
`app/api/strava/activities/route.ts`

## Request

### Method
`GET`

### Authentication
Requires Strava OAuth cookies

## Response

### Success (200 OK)
```json
{
  "success": true,
  "activities": [
    {
      "id": 123456789,
      "name": "Morning Run",
      "distance": 8047,
      "start_date": "2024-11-01T08:00:00Z",
      "elapsed_time": 2400,
      "type": "Run",
      "workout_type": 0
    }
  ]
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Not authenticated with Strava",
  "authRequired": true
}
```

**500 Internal Server Error**
```json
{
  "error": "Strava API not configured"
}
```

## Dependencies

### Environment Variables
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`

### Cookies
- `strava_access_token`
- `strava_refresh_token`
- `strava_expires_at`

## Features

- Fetches up to 150 recent activities
- Filters for "Run" type only
- Includes race activities (workout_type: 1)
- Auto-refreshes expired tokens
- Returns mock data in development mode if API fails

## Testing
```bash
curl http://localhost:3000/api/strava/activities \
  -H "Cookie: strava_access_token=..."
```

## Related Documentation
- [Strava Integration](../third-party/strava.md)
