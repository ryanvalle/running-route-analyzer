# Strava Analysis Page (/analysis/[stravaUser]/[activityId])

## Overview
Shareable page for Strava activity analysis.

## File Location
`app/analysis/[stravaUser]/[activityId]/page.tsx`

## URL Parameters
- `stravaUser`: Athlete ID from Strava
- `activityId`: Activity ID from Strava

## Example URL
```
/analysis/123456/987654321
```

## Features

- Direct link to activity analysis
- Fetches data from Strava API
- Displays full analysis
- Shareable URL
- SEO optimized

## Data Flow

1. Extract params from URL
2. Call `/api/strava/activity/[activityId]`
3. Call `/api/analyze` with points
4. Display RouteAnalysisDisplay

## SEO

- Dynamic title with activity name
- Open Graph tags
- Twitter cards
- Activity metadata

## Authentication

Requires Strava authentication if:
- Activity is private
- API credentials configured

Falls back to demo data if not authenticated.

## Related Documentation

- [Strava API](../api-routes/strava-activity-id.md)
- [Analyze API](../api-routes/analyze.md)
