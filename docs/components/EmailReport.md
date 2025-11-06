# EmailReport Component

## Overview
Dialog component for sending route analysis reports via email.

## File Location
`components/EmailReport.tsx`

## Props

```typescript
interface EmailReportProps {
  analysis: RouteAnalysis;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `analysis` | `RouteAnalysis` | Yes | Route analysis to send |
| `mapContainerRef` | `RefObject` | Yes | Ref to map container for screenshot |
| `chartContainerRef` | `RefObject` | Yes | Ref to chart container for screenshot |

## State

```typescript
const [isOpen, setIsOpen] = useState(false);
const [email, setEmail] = useState('');
const [sending, setSending] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## Usage

```tsx
import EmailReport from '@/components/EmailReport';

const mapRef = useRef<HTMLDivElement>(null);
const chartRef = useRef<HTMLDivElement>(null);

<EmailReport
  analysis={analysisData}
  mapContainerRef={mapRef}
  chartContainerRef={chartRef}
/>
```

## Features

### Email Dialog
- Modal/dialog overlay
- Email input field
- Send button
- Loading state
- Success message
- Error handling
- Close button

### Image Capture
**Map Capture** (using leaflet-image):
```typescript
import leafletImage from 'leaflet-image';

const mapCanvas = await captureMapImage();
const mapImage = mapCanvas?.toDataURL('image/png');
```

**Chart Capture** (using html2canvas):
```typescript
import html2canvas from 'html2canvas';

const canvas = await html2canvas(chartContainerRef.current, {
  backgroundColor: '#ffffff',
  scale: 2,
  logging: false,
});
const chartImage = canvas.toDataURL('image/png');
```

### Send Process
1. User clicks "Email Report" button
2. Dialog opens
3. User enters email address
4. User clicks "Send"
5. Component captures map image
6. Component captures chart image
7. POSTs to `/api/send-email` with:
   - Email address
   - Analysis data
   - Map image (base64)
   - Chart image (base64)
8. Shows success or error message

## Dependencies

### External Libraries
```typescript
import html2canvas from 'html2canvas';
import leafletImage from 'leaflet-image';
```

### Internal
```typescript
import { RouteAnalysis } from '@/types';
```

### API Endpoints
- `POST /api/send-email`

## Validation

### Email Validation
```typescript
if (!email || !email.includes('@')) {
  setError('Please enter a valid email address');
  return;
}
```

### Image Validation
```typescript
if (!mapImage || !chartImage) {
  setError('Failed to capture images');
  return;
}
```

## Error Handling

### Common Errors
- Missing email
- Invalid email format
- Image capture failure
- Network error
- API not configured
- Send failure

### Error Display
```typescript
{error && (
  <div className="error-message">
    {error}
  </div>
)}
```

## Success State

After successful send:
```typescript
<div className="success-message">
  ✓ Email sent successfully! Check your inbox.
</div>
```

Auto-closes dialog after 3 seconds.

## Styling

- Modal overlay (dark semi-transparent)
- Card-style dialog
- Centered on screen
- Responsive sizing
- Dark mode support
- Loading spinner
- Disabled state for button

## Testing

### Manual Testing Checklist
- [ ] Dialog opens when button clicked
- [ ] Email input works
- [ ] Send button disabled while sending
- [ ] Map image captured correctly
- [ ] Chart image captured correctly
- [ ] Email sent successfully
- [ ] Success message shows
- [ ] Error messages display correctly
- [ ] Dialog closes after success
- [ ] Close button works

### Unit Tests
Currently no tests exist. Consider adding:
- Email validation tests
- Image capture mocking
- API call mocking
- Error state tests
- Success state tests

## Performance

### Image Capture
- Map capture: 500ms - 1s
- Chart capture: 200ms - 500ms
- Total: ~1-2 seconds

### Optimization
- Could cache images if sending multiple times
- Could compress images before sending
- Could show progress indicator

## Accessibility

- Focus trap in dialog
- ESC key closes dialog
- Click outside closes dialog
- Semantic HTML
- Button labels
- Error announcements

## Security

### Data Sanitization
- Email validated on client and server
- Images validated as PNG data URLs
- No user-generated HTML in emails

## Related Documentation

- [Send Email API](../api-routes/send-email.md)
- [Resend Integration](../third-party/resend.md)
- [RouteAnalysisDisplay](./RouteAnalysisDisplay.md)
- [RouteMap](./RouteMap.md)
- [ElevationChart](./ElevationChart.md)
