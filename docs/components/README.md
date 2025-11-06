# Components Documentation

This directory contains documentation for all React components in the Running Route Analyzer application.

## Component Overview

### Core Components
- [FileUpload](./FileUpload.md) - GPX file upload with drag-and-drop
- [StravaInput](./StravaInput.md) - Strava activity URL input
- [RouteAnalysisDisplay](./RouteAnalysisDisplay.md) - Main analysis display with settings
- [ElevationChart](./ElevationChart.md) - Interactive elevation profile chart
- [RouteMap](./RouteMap.md) - Interactive map with Leaflet
- [EmailReport](./EmailReport.md) - Email report dialog

## Component Architecture

```
page.tsx (Main App)
├── StravaInput
│   └── Fetches activity data
├── FileUpload
│   └── Uploads GPX file
└── RouteAnalysisDisplay
    ├── ElevationChart
    │   └── Interactive chart with hover
    ├── RouteMap
    │   └── Interactive map with markers
    └── EmailReport
        └── Email dialog
```

## Common Patterns

### Client Components
All components use `'use client'` directive as they:
- Use React hooks (useState, useEffect, useRef)
- Handle user interactions
- Render interactive UI

### TypeScript Types
All components use types from `@/types`:
- `RoutePoint`
- `RouteAnalysis`
- `RouteSegment`
- `DistanceUnit`
- `SegmentIncrement`

## Testing

Currently no unit or component tests exist. Consider adding:
- Component rendering tests
- User interaction tests
- Props validation tests

## Related Documentation

- [API Routes](../api-routes/) - Server-side endpoints
- [Types](../types.md) - TypeScript type definitions
- [Overview](../overview.md) - Application overview
