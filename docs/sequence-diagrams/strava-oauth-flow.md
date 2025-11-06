# Strava OAuth 2.0 Authentication Flow

This diagram shows the complete OAuth authentication flow with Strava.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AuthInitiate as /api/auth/strava
    participant Strava as Strava OAuth
    participant Callback as /api/auth/strava/callback
    participant Cookies
    participant HomePage

    User->>Browser: Click "Login with Strava"
    Browser->>AuthInitiate: GET /api/auth/strava
    
    AuthInitiate->>AuthInitiate: Check STRAVA_CLIENT_ID configured
    AuthInitiate->>AuthInitiate: Build authorization URL
    Note over AuthInitiate: https://www.strava.com/oauth/authorize<br/>?client_id={id}<br/>&redirect_uri={callback}<br/>&response_type=code<br/>&scope=activity:read_all
    
    AuthInitiate-->>Browser: 302 Redirect to Strava
    
    Browser->>Strava: GET /oauth/authorize
    Strava->>Browser: Show login page
    
    User->>Strava: Enter credentials
    User->>Strava: Click "Authorize"
    
    Strava->>Strava: Validate credentials
    Strava->>Strava: Generate authorization code
    Strava-->>Browser: 302 Redirect to callback?code={auth_code}
    
    Browser->>Callback: GET /api/auth/strava/callback?code={auth_code}
    
    Callback->>Callback: Extract authorization code
    Callback->>Callback: Check STRAVA_CLIENT_ID & SECRET
    
    Callback->>Strava: POST /oauth/token<br/>{<br/>  client_id,<br/>  client_secret,<br/>  code,<br/>  grant_type: 'authorization_code'<br/>}
    
    Strava->>Strava: Validate authorization code
    Strava->>Strava: Generate access & refresh tokens
    Strava-->>Callback: {<br/>  access_token,<br/>  refresh_token,<br/>  expires_at,<br/>  athlete: {...}<br/>}
    
    Callback->>Cookies: Set httpOnly cookies
    Note over Callback,Cookies: strava_access_token (6 hours)<br/>strava_refresh_token (30 days)<br/>strava_expires_at (30 days)
    
    Callback-->>Browser: 302 Redirect to /?auth=success
    
    Browser->>HomePage: Load homepage
    HomePage->>HomePage: Check auth query param
    HomePage->>Browser: Show success message
    Browser-->>User: "Successfully authenticated with Strava!"
    
    Note over User,HomePage: User can now access real<br/>Strava activity data
```

## Security Features

1. **httpOnly Cookies**: Tokens not accessible to JavaScript (XSS protection)
2. **Secure Flag**: HTTPS-only in production
3. **SameSite: lax**: CSRF protection
4. **Token Expiration**: Access token valid 6 hours, refresh token 30 days
5. **Environment Variables**: Client secret never exposed to client

## Token Management

### Access Token
- **Lifetime**: 6 hours
- **Storage**: httpOnly cookie
- **Purpose**: API requests to Strava
- **Renewal**: Auto-refreshed when expired

### Refresh Token
- **Lifetime**: 30 days
- **Storage**: httpOnly cookie
- **Purpose**: Obtain new access tokens
- **Security**: Must re-authenticate after expiration

## OAuth Scopes

- `activity:read_all` - Read all activities including private ones

## Error Scenarios

### User Denies Authorization
```
Strava -->> Browser: Redirect to callback?error=access_denied
Callback -->> Browser: Redirect to /?error=access_denied
```

### Token Exchange Fails
```
Callback -->> Browser: Redirect to /?error=token_exchange_failed
```

### Configuration Error
```
AuthInitiate -->> Browser: { error: "Strava API not configured" }
```

## Cookie Configuration

```typescript
{
  httpOnly: true,           // Not accessible via JavaScript
  secure: NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',          // CSRF protection
  maxAge: 60 * 60 * 6       // 6 hours for access token
}
```

## Related Diagrams

- [Strava Activity Flow](./strava-activity-flow.md) - Using authenticated tokens
- [Strava Data Flow](./strava-data-flow.md) - Token refresh mechanism
