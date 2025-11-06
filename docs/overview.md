# Running Route Analyzer - Overview

## What is Running Route Analyzer?

Running Route Analyzer is a Next.js web application that analyzes running routes from Strava activities or uploaded GPX files, providing detailed elevation profiles, mile-by-mile terrain breakdowns, and AI-powered coaching insights. The app helps runners prepare for races and training runs by understanding the elevation changes, terrain characteristics, and pacing strategies for their routes.

## Key Features

- **Route Analysis**: Get detailed mile-by-mile (or kilometer-by-kilometer) breakdowns of routes with customizable increments (0.25, 0.5, or 1)
- **Elevation Profiles**: Interactive elevation charts showing gain, loss, and grade for each segment
- **AI Coaching Insights**: Personalized pacing strategies and recommendations powered by OpenAI's GPT-4
- **Email Reports**: Send beautifully formatted HTML email reports with high-resolution map and chart images
- **Strava Integration**: Analyze routes directly from Strava activity URLs with OAuth 2.0 authentication
- **GPX File Support**: Upload and analyze GPX files from GPS devices or running watches
- **Demo Mode**: Works without Strava API credentials using generated demo data
- **Dark Mode**: Fully responsive design with dark mode support
- **Interactive Maps**: Route visualization using Leaflet with segment highlighting
- **Unit Switching**: Support for both miles and kilometers with persistent preferences

## Tech Stack

### Framework & Core
- **Next.js 16** (App Router) - React framework for production
- **React 19** - UI library
- **TypeScript 5** - Type-safe development

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Third-Party APIs & Services
- **Strava API v3** - Activity data and OAuth authentication
- **OpenAI API** (GPT-4o-mini) - AI coaching insights
- **Resend** - Email delivery service

### Key Libraries
- **gpx-parser-builder** - GPX file parsing
- **Leaflet** & **react-leaflet** - Interactive maps
- **leaflet-image** - Map screenshot capture
- **html2canvas** - Chart screenshot capture
- **dompurify** - HTML sanitization for AI-generated content
- **Vercel Analytics** - Usage analytics

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking

## Application Architecture

```
running-route-analyzer/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── analyze/              # Route analysis endpoint
│   │   ├── auth/strava/          # Strava OAuth flow
│   │   ├── gpx-upload/           # GPX file upload
│   │   ├── gpx-analysis/         # GPX analysis retrieval
│   │   ├── send-email/           # Email report sending
│   │   └── strava/               # Strava API integration
│   ├── analysis/                 # Strava activity analysis pages
│   ├── analysis-gpx/             # GPX analysis pages
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application page
├── components/                   # React components
│   ├── FileUpload.tsx            # GPX file upload component
│   ├── StravaInput.tsx           # Strava URL input
│   ├── RouteAnalysisDisplay.tsx  # Main analysis display
│   ├── ElevationChart.tsx        # Interactive elevation chart
│   ├── RouteMap.tsx              # Interactive map with Leaflet
│   └── EmailReport.tsx           # Email report dialog
├── lib/                          # Utility functions and business logic
│   ├── routeAnalysis.ts          # Core route analysis logic
│   ├── openai.ts                 # OpenAI integration
│   ├── cache.ts                  # In-memory caching
│   ├── constants.ts              # Unit conversion constants
│   └── prompts/                  # AI prompt templates
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Shared types
├── public/                       # Static assets
└── docs/                         # Documentation (you are here!)
```

## Setup Instructions

### Prerequisites
- Node.js 20.x or higher (see `.nvmrc`)
- npm or yarn package manager
- (Optional) API keys for Strava, OpenAI, and Resend

### Basic Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ryanvalle/running-route-analyzer.git
   cd running-route-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

The app will work in demo mode without API credentials. To enable full functionality, continue with the API configuration below.

### API Configuration (Optional but Recommended)

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Strava API** (for real activity data):
   - Visit [Strava API Settings](https://www.strava.com/settings/api)
   - Create a new application
   - Set Authorization Callback Domain to `http://localhost:3000/api/auth/strava/callback`
   - Copy Client ID and Client Secret to `.env.local`:
     ```
     STRAVA_CLIENT_ID=your_client_id
     STRAVA_CLIENT_SECRET=your_client_secret
     STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
     ```

3. **Configure OpenAI API** (for AI coaching insights):
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add to `.env.local`:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ```

4. **Configure Resend API** (for email reports):
   - Sign up at [Resend](https://resend.com) (free tier: 100 emails/day)
   - Create an API key
   - Add to `.env.local`:
     ```
     RESEND_API_KEY=your_resend_api_key
     ```

### Building for Production

```bash
npm run build
npm start
```

### Deployment to Vercel

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Update Strava OAuth callback URL to match your production domain
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryanvalle/running-route-analyzer)

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint code linter

## How It Works

### Data Flow

1. **Input**: User provides route data via:
   - Strava activity URL (with or without OAuth)
   - Uploaded GPX file

2. **Processing**:
   - GPS coordinates and elevation data are extracted
   - Route is segmented into customizable intervals (0.25mi/km, 0.5mi/km, or 1mi/km)
   - Elevation gain, loss, and grade calculated for each segment
   - Natural language summary generated

3. **AI Enhancement** (if configured):
   - Route analysis sent to OpenAI GPT-4o-mini
   - AI generates personalized coaching insights
   - HTML-formatted response sanitized and displayed

4. **Output**:
   - Interactive map with route visualization
   - Elevation chart with hoverable segments
   - Mile-by-mile breakdown table
   - AI coaching recommendations
   - Optional email report with embedded images

### Caching Strategy

- **In-memory cache** (1-hour TTL) for:
  - Strava activity data
  - AI coaching insights
  - GPX analysis results
- **localStorage** for:
  - User preferences (units, increment)
  - Strava OAuth tokens (via httpOnly cookies)

### Security Features

- **OAuth 2.0** for Strava authentication
- **httpOnly cookies** for token storage
- **DOMPurify** for HTML sanitization
- **Input validation** on all API routes
- **SSRF protection** for URL resolution
- **Environment variable** protection for API keys

## Common Use Cases

1. **Race Preparation**: Analyze a race course to understand elevation challenges and plan pacing strategy
2. **Training Route Planning**: Evaluate training routes for desired elevation gain/loss
3. **Post-Run Analysis**: Review completed activities from Strava with detailed breakdowns
4. **Course Sharing**: Email detailed route reports to training partners or coaches
5. **GPX File Analysis**: Analyze routes from any GPS device or watch

## Data Privacy

- App runs entirely in your browser and on edge functions
- No route data is permanently stored (only cached for 1 hour)
- Strava OAuth tokens stored in secure httpOnly cookies
- No user tracking beyond Vercel Analytics
- OpenAI only receives elevation and distance data, not GPS coordinates

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design

## Contributing

Contributions are welcome! See the main [README.md](../README.md) for details.

## License

MIT License - See [LICENSE](../LICENSE) for details.

## Additional Documentation

- [Components Documentation](./components/) - React components and their props
- [API Routes Documentation](./api-routes/) - Server-side API endpoints
- [Application Routes Documentation](./app-routes/) - Client-side routes
- [Library Utilities Documentation](./lib/) - Shared utility functions
- [Third-Party Integrations](./third-party/) - External API setup and usage
