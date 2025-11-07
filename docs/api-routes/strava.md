# POST /api/strava

## Overview
Fetches Strava activity data or returns demo data if not authenticated.

## File Location
`app/api/strava/route.ts`

## Request

### Method
`POST`

### Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activityUrl` | `string` | Yes | Strava activity URL |

### Example Request
```json
{
  "activityUrl": "https://www.strava.com/activities/123456789"
}
```

## Response

### Success (Authenticated)
```json
{
  "success": true,
  "points": [...],
  "demo": false,
  "activityId": "123456789",
  "activityName": "Morning Run",
  "athleteId": "987654"
}
```

### Success (Demo Mode)
```json
{
  "success": true,
  "points": [...],
  "demo": true,
  "message": "Using demo data. To use real Strava data, configure Strava API credentials.",
  "activityId": "123456789",
  "athleteId": "0"
}
```

### Error Responses

**400 Bad Request** - No URL
```json
{
  "error": "Activity URL is required"
}
```

**400 Bad Request** - Invalid URL
```json
{
  "error": "Invalid Strava activity URL. Could not extract activity ID from short link: {url}. Use web link instead"
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Not authenticated with Strava",
  "authRequired": true,
  "authUrl": "/api/auth/strava"
}
```

## Dependencies

### Environment Variables
- `STRAVA_CLIENT_ID` (optional)
- `STRAVA_CLIENT_SECRET` (optional)

### Cookies
- `strava_access_token`
- `strava_refresh_token`
- `strava_expires_at`

## Features

### Short Link Resolution
Automatically resolves strava.app.link URLs to full URLs.

### Token Refresh
Automatically refreshes expired tokens.

### Demo Mode
Returns realistic mock data when credentials not configured.

## Testing

```bash
# Authenticated (requires cookies)
curl -X POST http://localhost:3000/api/strava \
  -H "Content-Type: application/json" \
  -H "Cookie: strava_access_token=..." \
  -d '{"activityUrl": "https://www.strava.com/activities/123456"}'

# Demo mode (no credentials)
curl -X POST http://localhost:3000/api/strava \
  -H "Content-Type: application/json" \
  -d '{"activityUrl": "https://www.strava.com/activities/123456"}'
```

## Related Documentation
- [Strava Integration](../third-party/strava.md)
- [Auth Strava](./auth-strava.md)
