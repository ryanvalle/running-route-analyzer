# GET /api/auth/strava

## Overview
Initiates Strava OAuth 2.0 authentication flow.

## File Location
`app/api/auth/strava/route.ts`

## Request

### Method
`GET`

### Parameters
None

### Example
```
GET /api/auth/strava
```

## Response

### Success
Redirects to Strava authorization page:
```
https://www.strava.com/oauth/authorize?client_id={id}&redirect_uri={uri}&response_type=code&scope=activity:read_all
```

### Error (500)
```json
{
  "error": "Strava API not configured"
}
```

## Dependencies

### Environment Variables
- `STRAVA_CLIENT_ID` (required)
- `STRAVA_REDIRECT_URI` (optional, defaults to localhost:3000)

## Flow
1. User visits `/api/auth/strava`
2. Builds authorization URL with client ID and redirect URI
3. Redirects to Strava
4. User logs in and authorizes
5. Strava redirects to callback with authorization code

## Testing
Visit in browser:
```
http://localhost:3000/api/auth/strava
```

Should redirect to Strava login page.

## Related Documentation
- [Auth Callback](./auth-strava-callback.md)
- [Strava Integration](../third-party/strava.md)
