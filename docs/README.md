# Running Route Analyzer Documentation

Welcome to the comprehensive documentation for the Running Route Analyzer application!

## 📚 Documentation Index

### Getting Started
- **[Overview](./overview.md)** - Application summary, tech stack, and setup instructions
  - What is this app?
  - Key features
  - Tech stack
  - Setup instructions
  - Architecture overview

### API Documentation
- **[API Routes](./api-routes/)** - Server-side API endpoints
  - Core analysis routes
  - Strava integration routes
  - Email routes
  - Request/response formats
  - Error handling

### Component Documentation
- **[Components](./components/)** - React client-side components
  - FileUpload - GPX file upload
  - StravaInput - Strava activity input
  - RouteAnalysisDisplay - Main analysis display
  - ElevationChart - Interactive chart
  - RouteMap - Interactive map
  - EmailReport - Email dialog

### Application Routes
- **[App Routes](./app-routes/)** - Client-side page routes
  - Main page (/)
  - Strava analysis pages
  - GPX analysis pages

### Library Utilities
- **[Lib Utilities](./lib/)** - Shared business logic
  - routeAnalysis.ts - Core analysis algorithms
  - openai.ts - AI integration
  - cache.ts - Caching system
  - constants.ts - Unit conversions
  - prompts - AI prompt templates

### Third-Party Integrations
- **[Third-Party APIs](./third-party/)** - External service integrations
  - [Strava API](./third-party/strava.md) - Activity data and OAuth
  - [OpenAI API](./third-party/openai.md) - AI coaching insights
  - [Resend API](./third-party/resend.md) - Email delivery

### Type Definitions
- **[TypeScript Types](./types.md)** - Shared type definitions
  - RoutePoint
  - RouteSegment
  - RouteAnalysis
  - DistanceUnit
  - SegmentIncrement

## 🗂️ Documentation Structure

```
docs/
├── README.md                    # This file
├── overview.md                  # Application overview
├── types.md                     # TypeScript types
├── api-routes/                  # API endpoint documentation
│   ├── README.md
│   ├── analyze.md
│   ├── gpx-upload.md
│   ├── strava.md
│   ├── send-email.md
│   └── ...
├── components/                  # Component documentation
│   ├── README.md
│   ├── FileUpload.md
│   ├── StravaInput.md
│   ├── RouteAnalysisDisplay.md
│   └── ...
├── app-routes/                  # Application route documentation
│   ├── README.md
│   ├── main-page.md
│   ├── strava-analysis.md
│   └── gpx-analysis.md
├── lib/                         # Library utility documentation
│   ├── README.md
│   ├── routeAnalysis.md
│   ├── openai.md
│   ├── cache.md
│   ├── constants.md
│   └── prompts.md
└── third-party/                 # Third-party integration documentation
    ├── strava.md
    ├── openai.md
    └── resend.md
```

## 🚀 Quick Start Guide

1. **[Read the Overview](./overview.md)** - Understand what the app does
2. **[Setup Third-Party APIs](./third-party/)** - Configure Strava, OpenAI, and Resend (optional)
3. **[Explore Components](./components/)** - Learn about the UI components
4. **[Review API Routes](./api-routes/)** - Understand the backend endpoints
5. **[Check Type Definitions](./types.md)** - Familiarize yourself with data structures

## 📖 Common Use Cases

### For Developers

#### Adding a New Feature
1. Review [types.md](./types.md) for data structures
2. Check [api-routes/](./api-routes/) for existing endpoints
3. Review [components/](./components/) for reusable UI
4. Check [lib/](./lib/) for utility functions

#### Understanding Data Flow
1. Start with [overview.md](./overview.md#how-it-works)
2. Follow user actions in [app-routes/](./app-routes/)
3. Trace API calls in [api-routes/](./api-routes/)
4. See processing in [lib/routeAnalysis.md](./lib/routeAnalysis.md)

#### Debugging Issues
1. Check [API Routes](./api-routes/) for endpoint behavior
2. Review [Third-Party](./third-party/) for external API issues
3. Check [Components](./components/) for UI behavior
4. Review error handling in each documentation file

### For Operators

#### Setting Up Production
1. Follow [overview.md setup guide](./overview.md#setup-instructions)
2. Configure [Strava API](./third-party/strava.md)
3. Configure [OpenAI API](./third-party/openai.md) (optional)
4. Configure [Resend API](./third-party/resend.md) (optional)

#### Troubleshooting
1. Check [Third-Party Integration docs](./third-party/) for API issues
2. Review [API Routes](./api-routes/) for error responses
3. Check environment variables in [overview.md](./overview.md)

## 🔍 Key Concepts

### Route Analysis Flow
```
Input (Strava URL or GPX) 
  → Parse GPS points 
  → Analyze elevation 
  → Generate segments 
  → Create summary 
  → (Optional) Get AI insights 
  → Display results
```

### Data Format
- **Input**: Array of GPS points with elevation
- **Processing**: Segment into increments (0.25, 0.5, or 1 mi/km)
- **Output**: Analysis with segments, totals, and summary

### Authentication
- **Strava**: OAuth 2.0 with httpOnly cookies
- **OpenAI**: API key (server-side only)
- **Resend**: API key (server-side only)

## 🧪 Testing

### Manual Testing
Each documentation file includes manual testing instructions:
- API routes: curl examples
- Components: testing checklists
- Integrations: setup verification

### Automated Testing
Currently no automated tests exist. Documentation notes where tests would be beneficial.

## 📝 Documentation Conventions

### File Organization
- Each major component/route/utility has its own file
- README.md in each directory provides overview
- Related files cross-reference each other

### Code Examples
- TypeScript types included
- curl commands for API testing
- Usage examples for functions/components

### Sections in Each Doc
- Overview
- File location
- Parameters/Props
- Usage examples
- Dependencies
- Testing
- Related documentation

## 🤝 Contributing to Documentation

When adding new features:
1. Document new types in [types.md](./types.md)
2. Document new API routes in [api-routes/](./api-routes/)
3. Document new components in [components/](./components/)
4. Document new utilities in [lib/](./lib/)
5. Update [overview.md](./overview.md) if architecture changes

## 📬 Additional Resources

- [Main README](../README.md) - Project README
- [GitHub Repository](https://github.com/ryanvalle/running-route-analyzer)
- [Vercel Deployment](https://vercel.com)

## 🗺️ Navigation Tips

- Use README files as starting points for each section
- Follow "Related Documentation" links to explore connected topics
- Ctrl/Cmd+F to search within files
- Check [overview.md](./overview.md) for high-level architecture

---

**Last Updated**: November 2024

**Documentation Version**: 1.0

**Application Version**: 0.1.0
