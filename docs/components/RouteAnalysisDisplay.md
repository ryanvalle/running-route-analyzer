# RouteAnalysisDisplay Component

## Overview
Main component for displaying route analysis with interactive map, elevation chart, segment table, and settings controls.

## File Location
`components/RouteAnalysisDisplay.tsx`

## Props

```typescript
interface RouteAnalysisDisplayProps {
  analysis: RouteAnalysis;
  onSettingsChange?: (unit: DistanceUnit, increment: SegmentIncrement) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `analysis` | `RouteAnalysis` | Yes | Route analysis data to display |
| `onSettingsChange` | `function` | No | Callback when unit or increment changes |

## Ref Interface

```typescript
interface RouteAnalysisDisplayRef {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
}
```

Exposes refs for map and chart containers (used by EmailReport for image capture).

## State

```typescript
const [manualHoveredSegmentIndex, setManualHoveredSegmentIndex] = useState<number | null>(null);
const [hoveredPoint, setHoveredPoint] = useState<RoutePoint | null>(null);
const [unit, setUnit] = useState<DistanceUnit>('miles');
const [increment, setIncrement] = useState<SegmentIncrement>(1);
```

## Usage

```tsx
import RouteAnalysisDisplay from '@/components/RouteAnalysisDisplay';

const ref = useRef<RouteAnalysisDisplayRef>(null);

<RouteAnalysisDisplay
  ref={ref}
  analysis={analysisData}
  onSettingsChange={(unit, increment) => {
    // Re-analyze with new settings
  }}
/>
```

## Features

### Settings Panel
- **Unit Toggle**: Switch between miles and kilometers
- **Increment Selector**: Choose 0.25, 0.5, or 1.0 segment size
- **Persistence**: Saves preferences to localStorage
- **Re-analysis**: Triggers onSettingsChange when modified

### Interactive Segments
- **Table Hover**: Highlight segment on map/chart
- **Chart Hover**: Highlight segment in table
- **Map Click**: Highlight nearest segment
- **Synchronized**: All views stay in sync

### AI Coaching Insights
- Displayed if `analysis.aiCoachingInsights` exists
- HTML sanitized with DOMPurify
- Styled with gradient background
- Collapsible section

### Email Report
- Button to open email dialog
- Passes refs to EmailReport component
- Captures map and chart as images

## Sub-Components

### RouteMap
Dynamic import (SSR disabled):
```typescript
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />
});
```

### ElevationChart
```typescript
<ElevationChart
  segments={analysis.segments}
  points={analysis.points}
  unit={unit}
  onSegmentHover={handleChartHover}
  highlightedSegmentIndex={hoveredSegmentIndex}
/>
```

### EmailReport
```typescript
<EmailReport
  analysis={analysis}
  mapContainerRef={mapContainerRef}
  chartContainerRef={chartContainerRef}
/>
```

## Dependencies

### External
```typescript
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
```

### Internal
```typescript
import { RouteAnalysis, RoutePoint, DistanceUnit, SegmentIncrement } from '@/types';
import ElevationChart from './ElevationChart';
import { METERS_TO_MILES, METERS_TO_KILOMETERS } from '@/lib/constants';
import { analyzeRoute } from '@/lib/routeAnalysis';
```

## Styling

- Tailwind CSS
- Dark mode support
- Responsive grid layout
- Color-coded elevation changes
- Gradient backgrounds for special sections

## Local Storage

### Keys
- `routeAnalyzerUnit`: Stores selected unit
- `routeAnalyzerIncrement`: Stores selected increment

### Values
- Unit: `'miles'` or `'kilometers'`
- Increment: `0.25`, `0.5`, or `1`

## Testing

### Manual Testing Checklist
- [ ] Settings persist across page reloads
- [ ] Unit toggle updates all displays
- [ ] Increment changes trigger re-analysis
- [ ] Hovering table row highlights segment
- [ ] Hovering chart highlights segment
- [ ] AI insights display when available
- [ ] Email button opens dialog
- [ ] Dark mode works correctly

### Unit Tests
Currently no tests exist. Consider adding:
- Settings change tests
- localStorage persistence tests
- Hover interaction tests
- Ref exposure tests

## Performance

### Dynamic Import
RouteMap uses dynamic import to:
- Avoid SSR issues with Leaflet
- Reduce initial bundle size
- Show loading placeholder

### Memoization
Consider adding useMemo for:
- Filtered points
- Segment calculations
- Sanitized HTML

## Accessibility

- Semantic HTML structure
- Button labels
- Table headers
- Color contrast (WCAG AA)
- Keyboard navigation supported

## Related Documentation

- [ElevationChart](./ElevationChart.md)
- [RouteMap](./RouteMap.md)
- [EmailReport](./EmailReport.md)
- [Route Analysis Library](../lib/routeAnalysis.md)
- [Types](../types.md)
