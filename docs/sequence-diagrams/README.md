# Sequence Diagrams

This directory contains sequence diagrams that visualize the architecture, request flows, data flows, and user experience flows of the Running Route Analyzer application.

## Diagram Index

### User Experience Flows
- [GPX Upload Flow](./gpx-upload-flow.md) - User uploads GPX file and views analysis
- [Strava Activity Flow](./strava-activity-flow.md) - User analyzes Strava activity
- [Email Report Flow](./email-report-flow.md) - User sends email report

### Authentication & Authorization
- [Strava OAuth Flow](./strava-oauth-flow.md) - OAuth 2.0 authentication with Strava

### Data Processing Flows
- [Route Analysis Flow](./route-analysis-flow.md) - Core route analysis processing
- [AI Insights Generation](./ai-insights-flow.md) - OpenAI coaching insights generation

### API Request Flows
- [API Request Overview](./api-request-overview.md) - High-level API architecture
- [GPX File Processing](./gpx-processing-flow.md) - Detailed GPX parsing and caching
- [Strava Data Fetching](./strava-data-flow.md) - Strava API interaction with token refresh

### Component Interaction Flows
- [Component Architecture](./component-architecture.md) - React component hierarchy and data flow
- [Map and Chart Interaction](./map-chart-interaction.md) - Interactive segment highlighting

## How to View

These diagrams use Mermaid syntax, which is natively supported by:
- **GitHub** - View directly in GitHub web interface
- **VS Code** - Install "Markdown Preview Mermaid Support" extension
- **IntelliJ/WebStorm** - Built-in Mermaid support
- **Online** - Copy/paste into [Mermaid Live Editor](https://mermaid.live/)

## Diagram Types

- **Sequence Diagrams**: Show interaction between components over time
- **Flowcharts**: Show decision trees and processing logic
- **State Diagrams**: Show state transitions
- **Architecture Diagrams**: Show system components and relationships

## Related Documentation

- [Overview](../overview.md) - Application architecture
- [API Routes](../api-routes/) - API endpoint details
- [Components](../components/) - Component documentation
- [Third-Party](../third-party/) - External integrations
