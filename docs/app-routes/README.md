# Application Routes Documentation

This directory contains documentation for client-side application routes.

## Routes Overview

- [Main Page (/)  ](./main-page.md) - Homepage with upload/input options
- [Strava Analysis (/analysis/[stravaUser]/[activityId])  ](./strava-analysis.md) - Strava activity analysis page
- [GPX Analysis (/analysis-gpx/[gpxId])  ](./gpx-analysis.md) - GPX file analysis page

## Route Structure

```
app/
├── page.tsx                                    # Main page (/)
├── analysis/[stravaUser]/[activityId]/
│   └── page.tsx                                # Strava analysis
└── analysis-gpx/[gpxId]/
    └── page.tsx                                # GPX analysis
```

## Related Documentation

- [API Routes](../api-routes/) - Server-side endpoints
- [Components](../components/) - React components used in routes
