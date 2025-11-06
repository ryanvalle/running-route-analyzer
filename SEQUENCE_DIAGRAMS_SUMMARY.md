# Sequence Diagrams Summary

## Overview
Added comprehensive sequence diagrams to visualize the application's architecture, request flows, data flows, and user experience flows.

## Location
All diagrams are in `docs/sequence-diagrams/` directory

## Diagrams Created (12 Total)

### User Experience Flows (3 diagrams)

#### 1. GPX Upload Flow (`gpx-upload-flow.md`)
Complete user journey from file selection to analysis display:
- File validation and upload
- GPX parsing with Haversine distance calculation
- Route analysis with O(n) segmentation
- Optional AI insights generation
- Caching with UUID for 1-hour TTL
- Interactive display rendering

#### 2. Strava Activity Flow (`strava-activity-flow.md`)
End-to-end Strava activity analysis:
- Auth status check on component mount
- URL input and validation
- Short link resolution (strava.app.link)
- Token refresh if expired
- Activity and stream data fetching
- Demo mode fallback
- Analysis with AI insights (cached by activity ID)

#### 3. Email Report Flow (`email-report-flow.md`)
Email report generation and delivery:
- Dialog interaction
- Parallel image capture (map via leaflet-image, chart via html2canvas)
- Base64 encoding
- HTML email template generation
- Resend API integration
- Success confirmation

### Authentication Flow (1 diagram)

#### 4. Strava OAuth Flow (`strava-oauth-flow.md`)
Complete OAuth 2.0 authentication:
- Authorization URL generation
- User login and consent
- Authorization code exchange
- Token storage in httpOnly cookies
- Security features (httpOnly, secure, sameSite)
- Callback handling and redirect

### Data Processing Flows (2 diagrams)

#### 5. Route Analysis Flow (`route-analysis-flow.md`)
Core analysis algorithm as flowchart:
- Input validation
- Distance conversion
- Elevation calculation loop
- Segment creation with running index optimization (O(n))
- Grade calculation and classification
- Natural language summary generation
- AI insights integration
- GPX caching

#### 6. AI Insights Flow (`ai-insights-flow.md`)
OpenAI integration process:
- Client initialization
- Cache check (1-hour TTL)
- Prompt building from route data
- GPT-4o-mini API call
- Response validation
- HTML sanitization with DOMPurify
- Cost analysis ($0.001-$0.003 per request)

### API & Architecture Flows (3 diagrams)

#### 7. API Request Overview (`api-request-overview.md`)
High-level architecture diagram:
- Component hierarchy
- API route organization
- Business logic layer (lib/)
- External services integration
- Data storage (cookies, memory cache)
- Request flow patterns
- Authentication patterns

#### 8. GPX Processing Flow (`gpx-processing-flow.md`)
Detailed GPX parsing:
- XML structure validation
- Track and segment extraction
- Point coordinate parsing
- Haversine formula implementation
- Distance accumulation
- Elevation range calculation
- Error recovery strategies

#### 9. Strava Data Flow (`strava-data-flow.md`)
Strava API interaction:
- URL resolution with SSRF protection
- Activity ID extraction and validation
- Token expiration check
- Automatic token refresh
- Activity metadata fetching
- Stream data retrieval
- Stream to RoutePoint conversion
- Demo mode generation

### Component Interaction Flows (2 diagrams)

#### 10. Component Architecture (`component-architecture.md`)
React component hierarchy:
- Main page state management
- Input components (StravaInput, FileUpload)
- Display component (RouteAnalysisDisplay)
- Visualization components (ElevationChart, RouteMap)
- Utility components (EmailReport)
- State flow and props drilling
- Event handling patterns
- Performance optimizations

#### 11. Map Chart Interaction (`map-chart-interaction.md`)
Synchronized segment highlighting:
- Table row hover → State update → Chart & map highlight
- Chart hover → State update → Table & map highlight
- Map click → State update → Table & chart highlight
- Visual feedback patterns
- State management
- Accessibility features
- Touch device support

## Diagram Format

### Mermaid Syntax
All diagrams use Mermaid, which is:
- ✅ Natively supported by GitHub
- ✅ Supported by VS Code (with extension)
- ✅ Supported by IntelliJ/WebStorm
- ✅ Viewable at [mermaid.live](https://mermaid.live/)

### Diagram Types Used
- **Sequence Diagrams**: Actor/component interactions over time
- **Flowcharts**: Decision trees and processing logic
- **State Diagrams**: State transitions
- **Graph Diagrams**: Architecture and relationships

## Key Features

### Comprehensive Coverage
- ✅ All user journeys documented
- ✅ All authentication flows shown
- ✅ All data processing detailed
- ✅ All API interactions visualized
- ✅ All component interactions mapped

### Technical Details
- ✅ Algorithm complexity noted (O(n))
- ✅ Security features highlighted (SSRF, XSS protection)
- ✅ Performance considerations included
- ✅ Error handling paths shown
- ✅ Caching strategies explained

### Educational Value
- ✅ Haversine formula explained
- ✅ OAuth 2.0 flow detailed
- ✅ Token refresh mechanism shown
- ✅ HTML sanitization process
- ✅ Cost estimates provided

## Navigation

### Master Index
Start at `docs/sequence-diagrams/README.md` for:
- Full diagram index
- Viewing instructions
- Related documentation links

### Cross-References
Each diagram links to:
- Related diagrams
- Relevant API documentation
- Component documentation
- Third-party integration guides

## Statistics

- **Total Files**: 13 (12 diagrams + 1 README)
- **Total Lines**: 2,195+ lines
- **Mermaid Diagrams**: 11 sequence diagrams + 1 flowchart + 1 state diagram
- **Coverage**: User flows, auth, data processing, API, components

## Viewing Instructions

### GitHub
Simply view the files in GitHub - Mermaid renders automatically

### VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open any diagram file
3. Press `Cmd/Ctrl + Shift + V` for preview

### Online
1. Copy diagram content
2. Visit https://mermaid.live/
3. Paste and view

## Integration with Existing Docs

### Updated Files
- `docs/README.md` - Added sequence diagrams section
- Documentation structure diagram updated

### Links Added
All existing documentation now references relevant sequence diagrams

## Use Cases

### For Developers
- Understand data flow before coding
- Visualize component interactions
- See authentication patterns
- Learn algorithm optimizations

### For Architects
- Review system design
- Understand API architecture
- See security implementations
- Evaluate performance strategies

### For Operators
- Understand authentication flow
- See token management
- Review error handling
- Understand caching strategy

---

**Created**: November 2024  
**Commit**: ce76734  
**Files Added**: 13  
**Lines Added**: 2,195+
