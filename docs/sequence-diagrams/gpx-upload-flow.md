# GPX Upload Flow - User Experience

This diagram shows the complete user experience flow when uploading and analyzing a GPX file.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant FileUpload as FileUpload Component
    participant API as /api/gpx-upload
    participant GPXParser as GPX Parser
    participant AnalyzeAPI as /api/analyze
    participant RouteAnalysis as Route Analysis
    participant OpenAI
    participant Display as RouteAnalysisDisplay

    User->>Browser: Visit homepage
    Browser->>FileUpload: Render upload component
    
    User->>FileUpload: Drop GPX file or click to upload
    FileUpload->>FileUpload: Validate .gpx extension
    FileUpload->>Browser: Show "Uploading..." state
    
    FileUpload->>API: POST /api/gpx-upload (FormData)
    API->>GPXParser: Parse GPX XML
    GPXParser->>GPXParser: Extract tracks and segments
    GPXParser->>GPXParser: Parse coordinates (lat, lng, elevation)
    GPXParser->>GPXParser: Calculate distances (Haversine formula)
    GPXParser-->>API: Return RoutePoint[]
    
    API-->>FileUpload: { success: true, points: [...], totalPoints: 1234 }
    FileUpload->>FileUpload: Clear loading state
    
    FileUpload->>AnalyzeAPI: POST /api/analyze<br/>{ points, isGpxUpload: true, unit, increment }
    
    AnalyzeAPI->>RouteAnalysis: analyzeRoute(points, unit, increment)
    RouteAnalysis->>RouteAnalysis: Calculate total distance
    RouteAnalysis->>RouteAnalysis: Calculate elevation gain/loss
    RouteAnalysis->>RouteAnalysis: Create segments by increment
    RouteAnalysis->>RouteAnalysis: Calculate grade for each segment
    RouteAnalysis->>RouteAnalysis: Generate terrain descriptions
    RouteAnalysis->>RouteAnalysis: Generate natural language summary
    RouteAnalysis-->>AnalyzeAPI: Return RouteAnalysis
    
    alt OpenAI Configured
        AnalyzeAPI->>OpenAI: Get AI coaching insights
        OpenAI->>OpenAI: Generate insights with GPT-4o-mini
        OpenAI-->>AnalyzeAPI: HTML coaching insights
    end
    
    AnalyzeAPI->>AnalyzeAPI: Generate UUID for GPX
    AnalyzeAPI->>AnalyzeAPI: Cache analysis (1 hour TTL)
    
    AnalyzeAPI-->>FileUpload: { success: true, analysis, gpxId }
    FileUpload->>Display: Render RouteAnalysisDisplay(analysis)
    
    Display->>Browser: Show elevation chart
    Display->>Browser: Show route map
    Display->>Browser: Show segment table
    Display->>Browser: Show AI insights (if available)
    
    Browser-->>User: Display complete analysis
    
    Note over User,Display: User can now interact with analysis,<br/>change settings, or email report
```

## Key Points

1. **File Validation**: Extension checked before upload
2. **GPS Parsing**: Haversine formula calculates accurate distances
3. **Analysis**: O(n) algorithm segments route efficiently
4. **Caching**: GPX analysis cached for 1 hour with UUID
5. **AI Optional**: Insights only generated if API key configured
6. **Interactive**: Analysis immediately interactive after rendering

## Error Handling

- Invalid file type → Error message shown
- Parse failure → "Failed to parse GPX file"
- No elevation data → "No valid GPS data with elevation found"
- API error → Generic error message with retry option

## Related Diagrams

- [Route Analysis Flow](./route-analysis-flow.md) - Detailed analysis algorithm
- [GPX Processing](./gpx-processing-flow.md) - GPX parsing details
- [Component Architecture](./component-architecture.md) - Component hierarchy
