# ElevationChart Component

## Overview
Interactive SVG elevation profile chart with hover effects and segment highlighting.

## File Location
`components/ElevationChart.tsx`

## Props

```typescript
interface ElevationChartProps {
  segments: RouteSegment[];
  points?: RoutePoint[];
  unit: DistanceUnit;
  onSegmentHover?: (index: number | null) => void;
  highlightedSegmentIndex?: number | null;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `segments` | `RouteSegment[]` | Yes | Segment data for chart |
| `points` | `RoutePoint[]` | No | GPS points for elevation line |
| `unit` | `DistanceUnit` | Yes | Display unit (miles/km) |
| `onSegmentHover` | `function` | No | Callback when segment hovered |
| `highlightedSegmentIndex` | `number \| null` | No | Index of segment to highlight |

## State

```typescript
const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
const [tooltip, setTooltip] = useState<{
  visible: boolean;
  x: number;
  y: number;
  content: string;
} | null>(null);
```

## Usage

```tsx
import ElevationChart from '@/components/ElevationChart';

<ElevationChart
  segments={analysis.segments}
  points={analysis.points}
  unit="miles"
  onSegmentHover={(index) => setHoveredSegment(index)}
  highlightedSegmentIndex={hoveredSegmentIndex}
/>
```

## Features

### Elevation Line
- Smooth SVG path through all points
- Filled area below line
- Gradient fill (blue to light blue)
- Responsive to container size

### Segment Bars
- Color-coded by elevation change:
  - Green: Net gain
  - Red: Net loss
  - Gray: Flat
- Hover effects
- Highlighted when selected

### Interactive Tooltip
- Shows on hover:
  - Segment range
  - Elevation change
  - Average grade
  - Description
- Follows mouse position
- Auto-hides when not hovering

### Responsive Design
- Resizes with container
- Maintains aspect ratio
- Updates on window resize

## Chart Calculations

### Scaling
```typescript
const xScale = (distance: number) => 
  (distance / maxDistance) * width;

const yScale = (elevation: number) => 
  height - ((elevation - minElevation) / elevationRange) * height;
```

### Path Generation
```typescript
const pathData = points
  .map((point, i) => {
    const x = xScale(point.distance);
    const y = yScale(point.elevation);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  })
  .join(' ');
```

## Dependencies

### Internal
```typescript
import { RouteSegment, RoutePoint, DistanceUnit } from '@/types';
import { METERS_TO_MILES, METERS_TO_KILOMETERS } from '@/lib/constants';
```

### React Hooks
- `useState` - Dimensions and tooltip state
- `useEffect` - Window resize listener
- `useRef` - SVG container ref

## Styling

- SVG-based rendering
- Tailwind CSS for container
- Inline styles for SVG elements
- CSS transitions for hover effects

## Accessibility

- `aria-label` on SVG
- Semantic structure
- Keyboard navigation (consider adding)
- Screen reader descriptions (consider adding)

## Testing

### Manual Testing Checklist
- [ ] Chart renders correctly
- [ ] Resizes with window
- [ ] Hover shows tooltip
- [ ] Segments highlight correctly
- [ ] Colors match elevation changes
- [ ] Works with different units
- [ ] Works with different increments

### Unit Tests
Currently no tests exist. Consider adding:
- Scaling calculation tests
- Path generation tests
- Resize handler tests
- Tooltip positioning tests

## Performance

### Optimization Opportunities
- Memoize path calculations
- Debounce resize handler
- Virtual rendering for large point sets
- Canvas fallback for huge datasets

## Image Capture

Used by EmailReport component:
```typescript
const chartImage = await html2canvas(chartContainerRef.current, {
  backgroundColor: '#ffffff',
  scale: 2,
  logging: false,
});
```

## Related Documentation

- [RouteAnalysisDisplay](./RouteAnalysisDisplay.md)
- [Types](../types.md)
- [EmailReport](./EmailReport.md)
