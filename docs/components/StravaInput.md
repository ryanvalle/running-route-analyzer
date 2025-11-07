# StravaInput Component

## Overview
Input field for entering Strava activity URLs with authentication status display.

## File Location
`components/StravaInput.tsx`

## Props

```typescript
interface StravaInputProps {
  onActivityFetch: (
    points: RoutePoint[],
    activityInfo?: { activityId: string; athleteId: string }
  ) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onActivityFetch` | `function` | Yes | Callback when activity data fetched successfully |

## State

```typescript
const [url, setUrl] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [authStatus, setAuthStatus] = useState<{
  authenticated: boolean;
  configured: boolean;
}>({ authenticated: false, configured: false });
```

## Usage

```tsx
import StravaInput from '@/components/StravaInput';

<StravaInput
  onActivityFetch={(points, activityInfo) => {
    // Handle fetched activity
    analyzeRoute(points, activityInfo);
  }}
/>
```

## Functionality

### Authentication Check
On component mount:
1. Calls `/api/strava/auth-status`
2. Updates authStatus state
3. Shows appropriate UI based on status

### Activity Fetch Process
1. User enters Strava URL
2. User clicks "Analyze"
3. Component sets loading state
4. POSTs to `/api/strava` with URL
5. Handles response:
   - Success: calls onActivityFetch callback
   - Auth required: shows login link
   - Error: displays error message
6. Resets loading state

### URL Formats Supported
- `https://www.strava.com/activities/123456789`
- `https://strava.app.link/...` (short links)
- Any URL containing `/activities/{id}`

## Dependencies

### Internal
```typescript
import { RoutePoint } from '@/types';
```

### API Endpoints
- `POST /api/strava`
- `GET /api/strava/auth-status`

## UI States

### Not Configured
Shows: "Strava integration not configured. Using demo data."

### Configured but Not Authenticated
Shows: "Not logged in to Strava" with login link

### Authenticated
Shows: "Logged in to Strava ✓"

### Demo Mode
Shows: Badge indicating demo data is being used

## Error Handling
- Invalid URL format
- Network errors
- Authentication errors
- Strava API errors

## Testing

### Manual Testing Checklist
- [ ] Auth status displayed correctly
- [ ] Login link works
- [ ] URL validation works
- [ ] Fetches real data when authenticated
- [ ] Returns demo data when not configured
- [ ] Loading state shows correctly
- [ ] Error messages display correctly

### Unit Tests
Currently no tests exist. Consider adding:
- Auth status check tests
- URL validation tests
- API call mocking
- Error handling tests

## Related Documentation

- [Strava API](../api-routes/strava.md)
- [Strava Integration](../third-party/strava.md)
