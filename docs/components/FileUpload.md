# FileUpload Component

## Overview
Provides drag-and-drop and click-to-upload interface for GPX files.

## File Location
`components/FileUpload.tsx`

## Props

```typescript
interface FileUploadProps {
  onUpload: (
    points: RoutePoint[],
    activityInfo?: { activityId: string; athleteId: string },
    isGpxUpload?: boolean
  ) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onUpload` | `function` | Yes | Callback when file successfully uploaded and parsed |

### Callback Parameters
- `points`: Array of RoutePoint objects
- `activityInfo`: Undefined for GPX uploads
- `isGpxUpload`: Always `true` for this component

## State

```typescript
const [uploading, setUploading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## Usage

```tsx
import FileUpload from '@/components/FileUpload';

<FileUpload
  onUpload={(points, _, isGpxUpload) => {
    // Handle uploaded points
    analyzeRoute(points, isGpxUpload);
  }}
/>
```

## Functionality

### File Selection
- Click on upload area to open file picker
- Drag and drop GPX file onto area
- Only accepts `.gpx` files

### Upload Process
1. User selects file
2. Component sets uploading state
3. Creates FormData with file
4. POSTs to `/api/gpx-upload`
5. On success: calls onUpload callback with points
6. On error: displays error message
7. Resets uploading state

### Error Handling
- Invalid file type
- Upload failure
- Parse errors
- Network errors

## Dependencies

### Internal
```typescript
import { RoutePoint } from '@/types';
```

### API Endpoints
- `POST /api/gpx-upload`

## Styling

- Tailwind CSS classes
- Dark mode support
- Hover effects
- Upload icon (SVG)
- Responsive design

## Testing

### Manual Testing Checklist
- [ ] Click to upload works
- [ ] Drag and drop works
- [ ] Only accepts .gpx files
- [ ] Shows uploading state
- [ ] Shows error messages
- [ ] Calls onUpload with correct data
- [ ] Dark mode styling works

### Unit Tests
Currently no tests exist. Consider adding:
- File upload simulation
- Error handling tests
- Callback invocation tests

## Accessibility

- Label associated with input
- Keyboard accessible (click to upload)
- Visual feedback for states (uploading, error)

## Related Documentation

- [GPX Upload API](../api-routes/gpx-upload.md)
- [RoutePoint Type](../types.md)
