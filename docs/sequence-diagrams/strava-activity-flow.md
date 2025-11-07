# Strava Activity Flow - User Experience

This diagram shows the complete flow when a user analyzes a Strava activity.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant StravaInput
    participant AuthStatus as /api/strava/auth-status
    participant StravaAPI as /api/strava
    participant StravaExternal as Strava API
    participant AnalyzeAPI as /api/analyze
    participant OpenAI
    participant Display as RouteAnalysisDisplay

    User->>Browser: Visit homepage
    Browser->>StravaInput: Render input component
    
    StravaInput->>AuthStatus: GET /api/strava/auth-status
    
    alt Strava Configured & Authenticated
        AuthStatus-->>StravaInput: { authenticated: true, configured: true }
        StravaInput->>Browser: Show "Logged in to Strava ✓"
    else Not Authenticated
        AuthStatus-->>StravaInput: { authenticated: false, configured: true }
        StravaInput->>Browser: Show login link
    else Not Configured
        AuthStatus-->>StravaInput: { authenticated: false, configured: false }
        StravaInput->>Browser: Show "Using demo data" message
    end
    
    User->>StravaInput: Enter Strava activity URL
    User->>StravaInput: Click "Analyze"
    StravaInput->>Browser: Show "Loading..." state
    
    StravaInput->>StravaAPI: POST /api/strava<br/>{ activityUrl }
    StravaAPI->>StravaAPI: Resolve short links (if needed)
    StravaAPI->>StravaAPI: Extract activity ID (regex validation)
    
    alt Strava Configured
        StravaAPI->>StravaAPI: Check OAuth tokens in cookies
        
        alt Token Expired
            StravaAPI->>StravaExternal: POST /oauth/token (refresh)
            StravaExternal-->>StravaAPI: New access token
            StravaAPI->>StravaAPI: Update cookies
        end
        
        StravaAPI->>StravaExternal: GET /api/v3/activities/{id}
        StravaExternal-->>StravaAPI: Activity metadata
        
        StravaAPI->>StravaExternal: GET /api/v3/activities/{id}/streams
        StravaExternal-->>StravaAPI: GPS and elevation data
        
        StravaAPI->>StravaAPI: Convert streams to RoutePoint[]
        StravaAPI-->>StravaInput: { success: true, points, demo: false, activityId, activityName }
        
    else Not Configured
        StravaAPI->>StravaAPI: Generate mock data (5km varied terrain)
        StravaAPI-->>StravaInput: { success: true, points, demo: true, message }
    end
    
    StravaInput->>AnalyzeAPI: POST /api/analyze<br/>{ points, activityId, unit, increment }
    
    AnalyzeAPI->>AnalyzeAPI: Check cache for AI insights
    AnalyzeAPI->>AnalyzeAPI: Analyze route (segments, grades, summary)
    
    alt OpenAI Configured & Not Cached
        AnalyzeAPI->>OpenAI: Get coaching insights
        OpenAI-->>AnalyzeAPI: HTML insights
        AnalyzeAPI->>AnalyzeAPI: Cache insights (1 hour)
    end
    
    AnalyzeAPI-->>StravaInput: { success: true, analysis }
    StravaInput->>Display: Render analysis
    
    Display->>Browser: Show complete analysis
    Browser-->>User: Interactive route visualization
    
    Note over User,Display: User sees activity name,<br/>demo badge (if applicable),<br/>and full analysis
```

## Key Features

1. **Auth Check**: Status checked on component mount
2. **Demo Mode**: Works without Strava credentials
3. **Token Refresh**: Automatic refresh of expired tokens
4. **Short Links**: Resolves strava.app.link URLs
5. **Caching**: AI insights cached by activity ID
6. **Real Data**: Full GPS and elevation from Strava streams

## Authentication States

- **Authenticated**: Full access to real activity data
- **Not Authenticated**: Redirect to OAuth or use demo data
- **Token Expired**: Auto-refresh with refresh token
- **Not Configured**: Demo mode with realistic mock data

## Error Scenarios

- Invalid URL → "Invalid Strava activity URL"
- Auth required → Show login link with auth URL
- Token refresh failed → Prompt re-authentication
- Private activity → Strava API returns 401
- Rate limit → Strava API returns 429

## Related Diagrams

- [Strava OAuth Flow](./strava-oauth-flow.md) - Authentication process
- [Strava Data Flow](./strava-data-flow.md) - API interaction details
- [Route Analysis Flow](./route-analysis-flow.md) - Analysis algorithm
