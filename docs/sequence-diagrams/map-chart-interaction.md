# Map and Chart Interaction - Segment Highlighting

This diagram shows how segment highlighting is synchronized across the map, chart, and table.

```mermaid
sequenceDiagram
    participant User
    participant Table as Segment Table
    participant State as RouteAnalysisDisplay State
    participant Chart as ElevationChart
    participant Map as RouteMap

    Note over User,Map: User hovers over table row

    User->>Table: Mouse enter row (index: 3)
    Table->>State: setManualHoveredSegmentIndex(3)
    State->>State: manualHoveredSegmentIndex = 3
    
    State->>Chart: Re-render with<br/>highlightedSegmentIndex={3}
    Chart->>Chart: Highlight segment 3
    Note over Chart: Change bar color<br/>from default to bright
    Chart->>Chart: Show tooltip for segment 3
    
    State->>Map: Re-render with<br/>highlightedSegmentIndex={3}
    Map->>Map: Highlight segment marker 3
    Note over Map: Change marker color<br/>from blue to orange
    
    State->>Table: Re-render with highlighted index
    Table->>Table: Add highlighted class to row 3
    Note over Table: Background color change
    
    Note over User,Map: User moves mouse to chart

    User->>Table: Mouse leave row
    Table->>State: setManualHoveredSegmentIndex(null)
    State->>State: manualHoveredSegmentIndex = null
    
    State->>Chart: Re-render with<br/>highlightedSegmentIndex={null}
    Chart->>Chart: Remove all highlights
    
    State->>Map: Re-render with<br/>highlightedSegmentIndex={null}
    Map->>Map: Remove all highlights
    
    State->>Table: Re-render with no highlight
    Table->>Table: Remove highlighted class
    
    Note over User,Map: User hovers over chart segment

    User->>Chart: Mouse enter segment bar (index: 2)
    Chart->>Chart: Show tooltip for segment 2
    Chart->>State: onSegmentHover(2)
    State->>State: setManualHoveredSegmentIndex(2)
    
    State->>Table: Re-render with<br/>highlightedSegmentIndex={2}
    Table->>Table: Highlight row 2
    Table->>Table: Scroll row into view (if needed)
    
    State->>Map: Re-render with<br/>highlightedSegmentIndex={2}
    Map->>Map: Highlight segment marker 2
    
    Note over User,Map: User clicks map marker

    User->>Map: Click segment marker (index: 4)
    Map->>State: onSegmentClick(4)
    State->>State: setManualHoveredSegmentIndex(4)
    
    State->>Chart: Re-render with<br/>highlightedSegmentIndex={4}
    Chart->>Chart: Highlight segment 4
    Chart->>Chart: Show tooltip for segment 4
    
    State->>Table: Re-render with<br/>highlightedSegmentIndex={4}
    Table->>Table: Highlight row 4
    Table->>Table: Scroll row into view
    
    Note over User,Map: All components synchronized!
```

## State Management

### Central State
```typescript
const [manualHoveredSegmentIndex, setManualHoveredSegmentIndex] = 
  useState<number | null>(null);
```

### Computed State
```typescript
const hoveredSegmentIndex = manualHoveredSegmentIndex;
```

### Prop Flow
```
RouteAnalysisDisplay
  ├─ highlightedSegmentIndex → ElevationChart
  ├─ highlightedSegmentIndex → RouteMap
  └─ highlightedSegmentIndex → SegmentTable (internal)
```

## Event Handlers

### Table Row Hover
```typescript
<tr 
  onMouseEnter={() => setManualHoveredSegmentIndex(index)}
  onMouseLeave={() => setManualHoveredSegmentIndex(null)}
  className={hoveredSegmentIndex === index ? 'bg-blue-100' : ''}
>
```

### Chart Segment Hover
```typescript
<ElevationChart
  onSegmentHover={(index) => setManualHoveredSegmentIndex(index)}
  highlightedSegmentIndex={hoveredSegmentIndex}
/>
```

### Map Marker Click
```typescript
<RouteMap
  onSegmentClick={(index) => setManualHoveredSegmentIndex(index)}
  highlightedSegmentIndex={hoveredSegmentIndex}
/>
```

## Visual Feedback

### Table
**Normal:**
```css
background: white (light mode)
background: gray-900 (dark mode)
```

**Highlighted:**
```css
background: blue-100 (light mode)
background: blue-900 (dark mode)
```

### Chart
**Normal:**
```css
fill: blue-500
opacity: 0.6
```

**Highlighted:**
```css
fill: blue-600
opacity: 1.0
stroke: blue-700
stroke-width: 2
```

### Map
**Normal Marker:**
```css
background: blue-500
color: white
border-radius: 50%
```

**Highlighted Marker:**
```css
background: orange-500
color: white
border-radius: 50%
transform: scale(1.2)
```

## Interaction Patterns

### Pattern 1: Explore by Table
```
User scans table
  → Hovers row
  → Sees location on map
  → Sees elevation on chart
  → Understands terrain
```

### Pattern 2: Explore by Chart
```
User examines chart
  → Hovers elevation peak
  → Sees mile marker in table
  → Sees location on map
  → Understands context
```

### Pattern 3: Explore by Map
```
User views route
  → Clicks segment marker
  → Sees details in table
  → Sees elevation in chart
  → Understands challenge
```

## Performance Considerations

### Re-render Optimization
```typescript
// Only highlighted components re-render
// Use React.memo for expensive components
const ElevationChart = React.memo(({ highlightedSegmentIndex, ... }) => {
  // Only re-renders when highlightedSegmentIndex changes
});
```

### Debouncing Hover
```typescript
// Optional: Debounce rapid hover events
const debouncedHover = useMemo(
  () => debounce(setManualHoveredSegmentIndex, 50),
  []
);
```

### Scroll Performance
```typescript
// Use scrollIntoView with smooth behavior
if (tableRef.current) {
  tableRef.current.rows[index].scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}
```

## Accessibility

### Keyboard Navigation
```typescript
// Arrow keys navigate segments
onKeyDown={(e) => {
  if (e.key === 'ArrowDown') {
    setManualHoveredSegmentIndex(Math.min(index + 1, maxIndex));
  }
  if (e.key === 'ArrowUp') {
    setManualHoveredSegmentIndex(Math.max(index - 1, 0));
  }
}}
```

### Screen Reader
```html
<tr 
  aria-selected={hoveredSegmentIndex === index}
  role="row"
>
  <td>Mile {segment.startMile} - {segment.endMile}</td>
</tr>
```

### Focus Management
```typescript
// Focus highlighted element
useEffect(() => {
  if (hoveredSegmentIndex !== null && tableRef.current) {
    const row = tableRef.current.rows[hoveredSegmentIndex];
    row?.focus();
  }
}, [hoveredSegmentIndex]);
```

## Touch Device Support

### Touch Events
```typescript
// Support tap on mobile
<div
  onClick={() => setManualHoveredSegmentIndex(index)}
  onTouchStart={() => setManualHoveredSegmentIndex(index)}
>
```

### Tap vs Scroll
```typescript
// Distinguish tap from scroll
let touchStartY = 0;
onTouchStart={(e) => {
  touchStartY = e.touches[0].clientY;
}}
onTouchEnd={(e) => {
  const touchEndY = e.changedTouches[0].clientY;
  if (Math.abs(touchEndY - touchStartY) < 10) {
    // This was a tap, not a scroll
    setManualHoveredSegmentIndex(index);
  }
}}
```

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> NoHighlight: Component mounts
    NoHighlight --> SegmentHighlighted: User hovers/clicks
    SegmentHighlighted --> NoHighlight: User moves away
    SegmentHighlighted --> DifferentSegment: User hovers different segment
    DifferentSegment --> SegmentHighlighted: 
    NoHighlight --> [*]: Component unmounts
```

## Related Diagrams

- [Component Architecture](./component-architecture.md) - Overall component structure
- [GPX Upload Flow](./gpx-upload-flow.md) - When components first render
- [Strava Activity Flow](./strava-activity-flow.md) - When components first render
