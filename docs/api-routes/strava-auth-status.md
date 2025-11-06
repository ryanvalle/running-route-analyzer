# GET /api/strava/auth-status

## Overview
Checks if user is authenticated with Strava.

## File Location
`app/api/strava/auth-status/route.ts`

## Request

### Method
`GET`

## Response

### Authenticated
```json
{
  "authenticated": true,
  "configured": true
}
```

### Not Authenticated
```json
{
  "authenticated": false,
  "configured": true
}
```

### Token Expired
```json
{
  "authenticated": false,
  "configured": true,
  "expired": true
}
```

### Not Configured
```json
{
  "authenticated": false,
  "configured": false,
  "message": "Strava API not configured"
}
```

## Dependencies

### Environment Variables
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`

### Cookies
- `strava_access_token`
- `strava_expires_at`

## Testing
```bash
curl http://localhost:3000/api/strava/auth-status
```

## Related Documentation
- [Strava Integration](../third-party/strava.md)
