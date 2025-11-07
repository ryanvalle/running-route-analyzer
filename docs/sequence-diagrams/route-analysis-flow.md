# Route Analysis Flow - Core Algorithm

This diagram shows the detailed route analysis algorithm and processing steps.

```mermaid
flowchart TD
    Start([POST /api/analyze]) --> ValidateInput{Validate Input}
    ValidateInput -->|Invalid| Error1[Return 400: Invalid points]
    ValidateInput -->|Valid| ParseParams[Parse Parameters]
    
    ParseParams --> SetDefaults[Set defaults:<br/>unit = 'miles'<br/>increment = 1]
    SetDefaults --> CallAnalyze[Call analyzeRoute]
    
    CallAnalyze --> CheckEmpty{Points array<br/>empty?}
    CheckEmpty -->|Yes| ReturnEmpty[Return empty analysis<br/>with message]
    CheckEmpty -->|No| ConvertDistance
    
    ConvertDistance[Convert total distance<br/>to selected unit] --> CalcElevation[Calculate total<br/>elevation changes]
    
    CalcElevation --> LoopPoints{For each<br/>point pair}
    LoopPoints --> CalcDiff[elevDiff = point[i].elevation<br/>- point[i-1].elevation]
    CalcDiff --> CheckSign{elevDiff > 0?}
    CheckSign -->|Yes| AddGain[totalElevationGain<br/>+= elevDiff]
    CheckSign -->|No| AddLoss[totalElevationLoss<br/>+= abs elevDiff]
    AddGain --> NextPoint{More points?}
    AddLoss --> NextPoint
    NextPoint -->|Yes| LoopPoints
    NextPoint -->|No| ConvertToFeet
    
    ConvertToFeet[Convert meters to feet] --> CreateSegments[Create segments by increment]
    
    CreateSegments --> CalcNumSegments[numSegments = ceil totalDistance / increment]
    CalcNumSegments --> InitIndex[currentPointIndex = 0]
    InitIndex --> SegmentLoop{For each segment}
    
    SegmentLoop --> FindPoints[Find points in segment<br/>O n operation]
    FindPoints --> CalcSegmentElev[Calculate segment<br/>elevation gain/loss]
    CalcSegmentElev --> CalcGrade[avgGrade = <br/> netElevChange / distance * 100]
    CalcGrade --> GenerateDesc{Classify grade}
    
    GenerateDesc -->|"-0.5% to 0.5%"| Flat[description = 'Relatively flat']
    GenerateDesc -->|"0.5% to 1%"| Gentle[description = 'Gentle climb']
    GenerateDesc -->|"1% to 3%"| Moderate[description = 'Moderate climb']
    GenerateDesc -->|"> 3%"| Steep[description = 'Steep climb']
    GenerateDesc -->|"< -0.5%"| Descent[description = 'Gentle/Moderate/Steep descent']
    
    Flat --> AddSegment[Add segment to array]
    Gentle --> AddSegment
    Moderate --> AddSegment
    Steep --> AddSegment
    Descent --> AddSegment
    
    AddSegment --> NextSegment{More segments?}
    NextSegment -->|Yes| SegmentLoop
    NextSegment -->|No| GenerateSummary
    
    GenerateSummary[Generate natural<br/>language summary] --> ReturnAnalysis[Return RouteAnalysis<br/>object]
    
    ReturnAnalysis --> CheckAI{OpenAI<br/>configured?}
    CheckAI -->|No| ReturnFinal[Return analysis]
    CheckAI -->|Yes| CheckCache{Check cache}
    
    CheckCache -->|Hit| UseCached[Use cached insights]
    CheckCache -->|Miss| CallOpenAI[Call getAICoachingInsights]
    
    CallOpenAI --> BuildPrompt[Build fitness coach prompt]
    BuildPrompt --> APICall[OpenAI API call<br/>GPT-4o-mini]
    APICall --> Sanitize[Sanitize HTML response]
    Sanitize --> CacheInsights[Cache insights 1 hour]
    CacheInsights --> UseCached
    
    UseCached --> AddToAnalysis[Add aiCoachingInsights<br/>to analysis]
    AddToAnalysis --> CheckGPX{isGpxUpload?}
    
    CheckGPX -->|Yes| GenUUID[Generate UUID]
    CheckGPX -->|No| ReturnFinal
    GenUUID --> CacheGPX[Cache analysis with UUID<br/> 1 hour TTL]
    CacheGPX --> ReturnWithID[Return analysis + gpxId]
    
    ReturnWithID --> End([Success Response])
    ReturnFinal --> End
    ReturnEmpty --> End
    Error1 --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style CallAnalyze fill:#fff3cd
    style CallOpenAI fill:#f8d7da
    style CacheInsights fill:#d4edda
    style CacheGPX fill:#d4edda
```

## Algorithm Complexity

- **Overall**: O(n) where n = number of points
- **Segmentation**: O(n) with running index optimization
- **Without optimization**: Would be O(n*m) where m = number of segments

## Key Optimizations

### Running Index
```typescript
let currentPointIndex = 0;
for (let i = 0; i < numSegments; i++) {
  let j = currentPointIndex;  // Start from last position
  // Find points for this segment
  currentPointIndex = j;      // Save for next iteration
}
```

**Benefit**: Each point visited exactly once instead of m times

### Boundary Handling
```typescript
// Include first point beyond segment end
// to capture elevation changes at boundary
if (firstPointBeyondEnd !== null) {
  segmentPoints.push(firstPointBeyondEnd);
}
```

## Grade Classification

| Grade Range | Description | Color |
|-------------|-------------|-------|
| -0.5% to 0.5% | Relatively flat | Gray |
| 0.5% to 1% | Gentle climb | Light green |
| 1% to 3% | Moderate climb | Green |
| > 3% | Steep climb | Dark green |
| -1% to -0.5% | Gentle descent | Light red |
| -3% to -1% | Moderate descent | Red |
| < -3% | Steep descent | Dark red |

## Summary Generation Logic

```typescript
// Identify flat opening miles
if (first 3 miles are flat/gentle) {
  "The first X miles will be relatively flat"
}

// Note elevation gain locations
if (segment.description includes 'climb' && previous doesn't) {
  "Expect elevation gain starting at mile X"
}
```

## Caching Strategy

### AI Insights Cache
- **Key**: `ai:coaching:{activityId}`
- **TTL**: 1 hour
- **Purpose**: Avoid duplicate OpenAI API calls
- **Cost savings**: ~$0.001-0.003 per cached request

### GPX Analysis Cache
- **Key**: `gpx:{uuid}`
- **TTL**: 1 hour
- **Purpose**: Allow shareable URLs
- **Data**: Full analysis + points

## Related Diagrams

- [AI Insights Flow](./ai-insights-flow.md) - OpenAI integration details
- [GPX Processing](./gpx-processing-flow.md) - Input processing
- [Component Architecture](./component-architecture.md) - How analysis is displayed
