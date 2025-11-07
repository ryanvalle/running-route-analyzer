# Main Page (/)

## Overview
Homepage with options to analyze routes from Strava or GPX files.

## File Location
`app/page.tsx`

## Features

### Upload Options
1. **Strava Activity URL** - Input field for Strava links
2. **GPX File Upload** - Drag-and-drop file upload

### Analysis Display
Shows RouteAnalysisDisplay component after successful upload/fetch

### Components Used
- StravaInput
- FileUpload
- RouteAnalysisDisplay

## User Flow

1. User visits homepage
2. Chooses input method:
   - Enter Strava URL OR
   - Upload GPX file
3. App fetches/parses data
4. Calls `/api/analyze`
5. Displays RouteAnalysisDisplay
6. User can:
   - View analysis
   - Change settings
   - Email report

## State Management

- Analysis data stored in component state
- Persists until page reload
- Settings saved to localStorage

## SEO

- Title: "Running Route Analyzer"
- Description: Route analysis with elevation profiles
- Metadata in layout.tsx

## Related Documentation

- [StravaInput Component](../components/StravaInput.md)
- [FileUpload Component](../components/FileUpload.md)
- [RouteAnalysisDisplay Component](../components/RouteAnalysisDisplay.md)
