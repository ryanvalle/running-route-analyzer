# RouteMap Component

## Overview
Interactive map using Leaflet to display routes with markers and segment highlighting.

## File Location
`components/RouteMap.tsx`

## Props

```typescript
interface RouteMapProps {
  points: RoutePoint[];
  highlightedSegmentIndex?: number | null;
  segments?: RouteSegment[];
  unit?: DistanceUnit;
  onSegmentClick?: (index: number) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `points` | `RoutePoint[]` | Yes | GPS points for route line |
| `highlightedSegmentIndex` | `number \| null` | No | Index of segment to highlight |
| `segments` | `RouteSegment[]` | No | Segment data for markers |
| `unit` | `DistanceUnit` | No | Display unit for markers |
| `onSegmentClick` | `function` | No | Callback when segment clicked |

## Features

### Route Line
- Polyline connecting all GPS points
- Blue color (#3b82f6)
- Interactive (clickable)
- Smooth rendering

### Start/End Markers
- **Green marker**: Route start
- **Red marker**: Route finish
- Custom icons with labels

### Segment Markers
- Numbered markers for each segment
- Shows segment start point
- Clickable to highlight segment
- Highlighted marker uses different color

### Map Controls
- Zoom controls
- Pan/drag
- Attribution
- Tile layer (OpenStreetMap)

### Auto-Fit Bounds
- Centers map on route
- Zooms to show entire route
- Adds padding for visibility

## Dependencies

### External Libraries
```typescript
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
```

**Packages**:
- `leaflet` v1.9.4
- `react-leaflet` v5.0.0
- `@types/leaflet` v1.9.21
- `leaflet-image` v0.4.0 (for image capture)

### Internal
```typescript
import { RoutePoint, RouteSegment, DistanceUnit } from '@/types';
```

## Custom Markers

### Green Start Marker
```typescript
const startIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div class="start-marker">Start</div>',
  iconSize: [40, 40],
});
```

### Red Finish Marker
```typescript
const finishIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div class="finish-marker">Finish</div>',
  iconSize: [40, 40],
});
```

### Numbered Segment Marker
```typescript
const segmentIcon = new L.DivIcon({
  className: 'segment-marker',
  html: `<div class="segment-number">${index + 1}</div>`,
  iconSize: [30, 30],
});
```

## Map Configuration

### Default Settings
```typescript
<MapContainer
  center={[points[0].lat, points[0].lng]}
  zoom={13}
  style={{ height: '400px', width: '100%' }}
  className="rounded-lg"
>
```

### Tile Layer
```typescript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

## Image Capture

### Capture Function
```typescript
import leafletImage from 'leaflet-image';

const captureMap = () => {
  return new Promise((resolve) => {
    leafletImage(mapRef.current, (err, canvas) => {
      if (err) {
        console.error('Error capturing map:', err);
        resolve(null);
        return;
      }
      resolve(canvas.toDataURL('image/png'));
    });
  });
};
```

Used by EmailReport component for email screenshots.

## SSR Considerations

**Important**: This component must be dynamically imported:
```typescript
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
});
```

**Reason**: Leaflet requires `window` object, not available during SSR.

## Styling

### CSS Files
```
leaflet/dist/leaflet.css (included)
```

### Custom Styles
```css
.custom-marker {
  /* Marker container */
}

.start-marker {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.finish-marker {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.segment-number {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Testing

### Manual Testing Checklist
- [ ] Map loads correctly
- [ ] Route line displays
- [ ] Start marker shows at beginning
- [ ] Finish marker shows at end
- [ ] Segment markers clickable
- [ ] Highlighted segment shows correctly
- [ ] Map auto-fits to route
- [ ] Zoom controls work
- [ ] Pan works
- [ ] Image capture works

### Unit Tests
Currently no tests exist. Consider adding:
- Marker positioning tests
- Click handler tests
- Bounds calculation tests

## Performance

### Optimization
- Use `useMemo` for marker positions
- Limit number of segment markers (skip for 0.25 increment)
- Consider clustering for dense routes

### Large Routes
- 5000+ points may be slow
- Consider decimation
- Consider showing simplified line

## Common Issues

### Markers Not Showing
- Ensure Leaflet CSS is imported
- Check marker icon paths
- Verify point coordinates valid

### Map Not Loading
- Component not dynamically imported
- SSR attempting to render
- Missing Leaflet CSS

## Accessibility

- `aria-label` on map container
- Keyboard navigation (limited by Leaflet)
- Consider adding text description

## Related Documentation

- [RouteAnalysisDisplay](./RouteAnalysisDisplay.md)
- [EmailReport](./EmailReport.md)
- [Types](../types.md)
- [Leaflet Documentation](https://leafletjs.com/)
