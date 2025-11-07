# GET /api/auth/strava/callback

## Overview
Handles OAuth callback from Strava and exchanges code for tokens.

## File Location
`app/api/auth/strava/callback/route.ts`

## Request

### Method
`GET`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | `string` | Yes | Authorization code from Strava |
| `error` | `string` | No | Error code if auth denied |

### Example
```
GET /api/auth/strava/callback?code=abc123def456
```

## Response

### Success
Redirects to homepage with cookies set:
```
Redirect: /?auth=success
Cookies:
  - strava_access_token (6 hours)
  - strava_refresh_token (30 days)
  - strava_expires_at (30 days)
```

### Error Redirects
```
/?error={error_code}
```

Error codes:
- `no_code` - No authorization code received
- `config_error` - Missing credentials
- `token_exchange_failed` - Failed to exchange code
- `callback_error` - Unexpected error

## Dependencies

### Environment Variables
- `STRAVA_CLIENT_ID` (required)
- `STRAVA_CLIENT_SECRET` (required)

## Security

### Cookie Settings
```typescript
{
  httpOnly: true,  // Prevents XSS
  secure: NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',  // CSRF protection
  maxAge: // varies by token type
}
```

## Testing
Complete full OAuth flow:
1. Visit `/api/auth/strava`
2. Log in to Strava
3. Authorize app
4. Should redirect to `/?auth=success`
5. Check cookies in browser DevTools

## Related Documentation
- [Auth Strava](./auth-strava.md)
- [Strava Integration](../third-party/strava.md)
