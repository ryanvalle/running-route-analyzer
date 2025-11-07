# Strava API Integration

## Overview

The Running Route Analyzer integrates with Strava's API v3 to fetch real activity data, including GPS coordinates, elevation profiles, and activity metadata. The integration uses OAuth 2.0 for secure authentication and supports automatic token refresh.

## Setup Steps

### 1. Create a Strava API Application

1. Log in to your Strava account
2. Navigate to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
3. Click "Create an App" or use an existing application
4. Fill in the application details:
   - **Application Name**: Your application name (e.g., "Route Analyzer")
   - **Category**: Choose "Data Importer" or appropriate category
   - **Club**: Optional
   - **Website**: Your application URL
   - **Authorization Callback Domain**: 
     - Development: `localhost:3000`
     - Production: Your production domain (e.g., `your-app.vercel.app`)

### 2. Get API Credentials

After creating the application, you'll receive:
- **Client ID**: A numeric identifier for your app
- **Client Secret**: A secret key (keep this confidential!)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
```

**Production Deployment:**
For Vercel or other hosting platforms, update `STRAVA_REDIRECT_URI` to match your production domain:
```bash
STRAVA_REDIRECT_URI=https://your-domain.vercel.app/api/auth/strava/callback
```

### 4. Update Strava Application Settings

In your Strava API application settings, ensure the Authorization Callback Domain matches your redirect URI domain (without the path):
- Development: `localhost:3000`
- Production: `your-domain.vercel.app`

## OAuth 2.0 Flow

### Authentication Process

1. **User initiates login**: User visits `/api/auth/strava`
2. **Redirect to Strava**: App redirects to Strava's authorization page
3. **User authorizes**: User grants permissions to the app
4. **Callback**: Strava redirects back to `/api/auth/strava/callback` with authorization code
5. **Token exchange**: App exchanges code for access and refresh tokens
6. **Store tokens**: Tokens stored in secure httpOnly cookies

### Scopes Requested

- `activity:read_all` - Read all activity data (required for route analysis)

### Token Management

**Access Token:**
- Valid for 6 hours
- Stored in httpOnly cookie
- Used for API requests

**Refresh Token:**
- Valid for 30 days
- Stored in httpOnly cookie
- Used to obtain new access tokens

**Automatic Refresh:**
The app automatically refreshes expired access tokens using the refresh token when making API requests.

## API Endpoints Used

### 1. Activity Details
**Endpoint:** `GET /api/v3/activities/{id}`

**Purpose:** Fetch activity metadata (name, distance, athlete info)

**Response Example:**
```json
{
  "id": 123456789,
  "name": "Morning Run",
  "distance": 8047.0,
  "type": "Run",
  "athlete": {
    "id": 987654
  },
  "start_date": "2024-11-01T08:00:00Z"
}
```

### 2. Activity Streams
**Endpoint:** `GET /api/v3/activities/{id}/streams?keys=latlng,distance,altitude&key_by_type=true`

**Purpose:** Fetch detailed GPS and elevation data

**Response Example:**
```json
{
  "latlng": {
    "data": [[37.7749, -122.4194], [37.7750, -122.4195], ...]
  },
  "distance": {
    "data": [0, 10.5, 21.3, ...]
  },
  "altitude": {
    "data": [100.0, 101.5, 103.2, ...]
  }
}
```

### 3. Athlete Activities
**Endpoint:** `GET /api/v3/athlete/activities?per_page=150`

**Purpose:** List recent activities for activity selection

**Response:** Array of activity objects (filtered for type "Run" in our app)

## Integration Points in the Application

### API Routes

#### `/api/auth/strava` (GET)
**File:** `app/api/auth/strava/route.ts`

**Purpose:** Initiates OAuth flow

**Dependencies:**
- Environment: `STRAVA_CLIENT_ID`, `STRAVA_REDIRECT_URI`

**Flow:**
1. Validates Strava credentials are configured
2. Builds authorization URL with client ID and redirect URI
3. Redirects user to Strava for authorization

#### `/api/auth/strava/callback` (GET)
**File:** `app/api/auth/strava/callback/route.ts`

**Purpose:** Handles OAuth callback and token exchange

**Dependencies:**
- Environment: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`

**Flow:**
1. Receives authorization code from Strava
2. Exchanges code for access/refresh tokens
3. Stores tokens in httpOnly cookies
4. Redirects to homepage with success message

**Testing:** Check for redirect errors (e.g., `?error=token_exchange_failed`)

#### `/api/strava` (POST)
**File:** `app/api/strava/route.ts`

**Purpose:** Fetch activity data from Strava or return demo data

**Request:**
```json
{
  "activityUrl": "https://www.strava.com/activities/123456789"
}
```

**Response (authenticated):**
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

**Response (demo mode):**
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

**Dependencies:**
- Environment: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` (optional)
- Cookies: `strava_access_token`, `strava_refresh_token`, `strava_expires_at`

**Flow:**
1. Validates and resolves activity URL (handles short links)
2. Extracts activity ID using regex validation
3. If credentials not configured: returns mock data
4. If not authenticated: returns 401 with auth URL
5. Checks token expiration and refreshes if needed
6. Fetches activity details and streams from Strava
7. Converts stream data to RoutePoint format
8. Returns data with activity metadata

**Testing:**
- Test with Strava short links (strava.app.link)
- Test with expired tokens (should auto-refresh)
- Test without credentials (should return demo data)

#### `/api/strava/activities` (GET)
**File:** `app/api/strava/activities/route.ts`

**Purpose:** List recent running activities

**Response:**
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

**Dependencies:**
- Environment: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`
- Cookies: `strava_access_token`, `strava_refresh_token`, `strava_expires_at`

**Testing:**
- Returns mock data in development mode if API fails
- Filters for "Run" type activities only

#### `/api/strava/auth-status` (GET)
**File:** `app/api/strava/auth-status/route.ts`

**Purpose:** Check authentication status

**Response:**
```json
{
  "authenticated": true,
  "configured": true,
  "expired": false
}
```

#### `/api/strava/activity/[activityId]` (GET)
**File:** `app/api/strava/activity/[activityId]/route.ts`

**Purpose:** Fetch specific activity data by ID

**Dependencies:**
- Similar to `/api/strava` but uses activity ID from URL parameter

## Helper Functions

### URL Resolution
**Function:** `resolveUrl(url: string): Promise<string>`

**Location:** `app/api/strava/route.ts`

**Purpose:** Resolve Strava short links (strava.app.link) to full URLs

**Security:**
- Validates domain is `strava.app.link`
- Validates resolved URL is legitimate Strava domain
- 5-second timeout to prevent hanging
- SSRF protection through domain whitelisting

### Stream Data Conversion
**Function:** `convertStravaStreamToPoints(streamData: StravaStreamData)`

**Location:** `app/api/strava/route.ts`

**Purpose:** Convert Strava stream format to RoutePoint format

**Input:**
```typescript
{
  latlng?: { data: [number, number][] };
  distance?: { data: number[] };
  altitude?: { data: number[] };
}
```

**Output:**
```typescript
RoutePoint[] = {
  lat: number;
  lng: number;
  elevation: number;
  distance: number;
}[]
```

### Mock Data Generator
**Function:** `generateMockStravaData()`

**Location:** `app/api/strava/route.ts`

**Purpose:** Generate realistic demo data when Strava credentials not configured

**Characteristics:**
- 5km route (100 points)
- Varied elevation profile
- First mile flat, middle section climbing, final section descending

## Components Using Strava

### StravaInput Component
**File:** `components/StravaInput.tsx`

**Purpose:** Input field for Strava activity URLs

**Dependencies:**
- Calls `/api/strava` (POST)
- Passes route points to parent component

**Validation:** None (see related tests, if any)

## Security Considerations

### Token Storage
- **httpOnly cookies**: Prevents XSS attacks from accessing tokens
- **secure flag**: Ensures HTTPS-only transmission in production
- **sameSite: lax**: Prevents CSRF attacks

### SSRF Protection
- URL validation before fetching short links
- Domain whitelisting (only `strava.app.link` and `*.strava.com`)
- Timeout protection (5 seconds)

### Input Validation
- Activity ID regex: `\d+` (digits only)
- Positive integer validation
- URL parsing and validation

### API Key Protection
- Stored in environment variables
- Never exposed to client
- Checked before API calls

## Rate Limits

Strava API has the following rate limits:
- **600 requests per 15 minutes** per application
- **30,000 requests per day** per application

The app uses caching to minimize API calls:
- Activity data cached for 1 hour
- AI insights cached per activity ID

## Troubleshooting

### Common Issues

**"Not authenticated with Strava"**
- User needs to visit `/api/auth/strava` to log in
- Check cookies are enabled
- Verify tokens haven't expired

**"Token refresh failed"**
- Refresh token expired (30 days)
- User needs to re-authenticate

**"Strava API not configured"**
- Missing environment variables
- Check `.env.local` has correct values

**"Invalid Strava activity URL"**
- URL doesn't match pattern `/activities/\d+/`
- Try copying URL from browser address bar
- Avoid using mobile app share links (use web link)

**Rate limit exceeded**
- Wait 15 minutes before retrying
- Check if multiple users sharing same API credentials

## Testing

### Manual Testing Checklist

- [ ] OAuth flow works (login, callback, token storage)
- [ ] Real activity data fetched correctly
- [ ] Demo mode works without credentials
- [ ] Token refresh works on expiration
- [ ] Short links resolve correctly
- [ ] Error handling for invalid URLs
- [ ] Error handling for private activities
- [ ] Error handling for deleted activities

### Unit Tests
Currently no unit tests exist for Strava integration. Consider adding:
- URL validation tests
- Stream data conversion tests
- Mock data generation tests

### Playwright/E2E Tests
Currently no E2E tests exist. Consider adding:
- OAuth flow test
- Activity fetching test
- Error state tests

## Additional Resources

- [Strava API Documentation](https://developers.strava.com/)
- [OAuth 2.0 Flow](https://developers.strava.com/docs/authentication/)
- [API Rate Limits](https://developers.strava.com/docs/rate-limits/)
- [Activity Streams](https://developers.strava.com/docs/reference/#api-Streams)

## Related Documentation

- [Overview](../overview.md) - Application overview and setup
- [API Routes](../api-routes/) - All API endpoints
- [Components](../components/StravaInput.md) - StravaInput component details
