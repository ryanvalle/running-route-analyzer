# GPX Analysis Page (/analysis-gpx/[gpxId])

## Overview
Shareable page for GPX file analysis.

## File Location
`app/analysis-gpx/[gpxId]/page.tsx`

## URL Parameters
- `gpxId`: UUID from GPX upload

## Example URL
```
/analysis-gpx/abc123-def456-ghi789
```

## Features

- Direct link to GPX analysis
- Retrieves from cache
- Displays full analysis
- Temporary URL (1-hour expiration)

## Data Flow

1. Extract gpxId from URL
2. Call `/api/gpx-analysis/[gpxId]`
3. If found: display analysis
4. If not found: show error (expired or invalid)

## Cache Expiration

- Data cached for 1 hour after upload
- After expiration: 404 error
- User must re-upload file

## SEO

- Title: "GPX Route Analysis"
- No indexing (robots: noindex)
- Temporary content

## Related Documentation

- [GPX Analysis API](../api-routes/gpx-analysis.md)
- [GPX Upload API](../api-routes/gpx-upload.md)
