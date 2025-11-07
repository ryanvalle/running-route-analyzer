# API Routes Documentation

This directory contains documentation for all server-side API endpoints in the Running Route Analyzer application.

## API Endpoints Overview

### Core Analysis Routes
- [POST /api/analyze](./analyze.md) - Analyze route points and generate elevation profile
- [POST /api/gpx-upload](./gpx-upload.md) - Upload and parse GPX files
- [GET /api/gpx-analysis/[gpxId]](./gpx-analysis.md) - Retrieve cached GPX analysis

### Strava Integration Routes
- [POST /api/strava](./strava.md) - Fetch Strava activity data
- [GET /api/auth/strava](./auth-strava.md) - Initiate Strava OAuth flow
- [GET /api/auth/strava/callback](./auth-strava-callback.md) - Handle OAuth callback
- [GET /api/strava/activities](./strava-activities.md) - List recent running activities
- [GET /api/strava/activity/[activityId]](./strava-activity-id.md) - Get specific activity
- [GET /api/strava/auth-status](./strava-auth-status.md) - Check auth status

### Email Routes
- [POST /api/send-email](./send-email.md) - Send email report

## Common Patterns

### Request/Response Format
All API routes use JSON for request and response bodies (except file uploads and OAuth redirects).

### Error Handling
Standard error response format:
```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### Authentication
Strava-related routes use httpOnly cookies for token storage:
- `strava_access_token`
- `strava_refresh_token`
- `strava_expires_at`

### Environment Variables
Routes may depend on:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`

## Testing API Routes

### Using curl

**Analyze route:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"lat": 37.7749, "lng": -122.4194, "elevation": 100, "distance": 0},
      {"lat": 37.7750, "lng": -122.4195, "elevation": 110, "distance": 100}
    ],
    "unit": "miles",
    "increment": 1
  }'
```

**Upload GPX:**
```bash
curl -X POST http://localhost:3000/api/gpx-upload \
  -F "file=@route.gpx"
```

### Using Postman
Import the routes into Postman and test with sample payloads provided in each route's documentation.

## Related Documentation
- [Third-Party Integrations](../third-party/) - External API setup
- [Components](../components/) - Client-side components
- [Overview](../overview.md) - Application overview
