# Route Analyzer

A Next.js application that analyzes routes from Strava activities or uploaded FIT files, providing detailed elevation profiles and terrain summaries.

## Features

- 📊 **Route Analysis**: Get detailed mile-by-mile breakdowns of routes
- 🏔️ **Elevation Profiles**: See elevation gain, loss, and grade for each segment
- 🤖 **AI Coaching Insights**: Get personalized pacing strategies and recommendations from an AI fitness coach (powered by OpenAI)
- 📧 **Email Reports**: Send yourself a fully formatted email with high-resolution map and chart images
- 🔗 **Strava Integration**: Analyze routes directly from Strava activity URLs (demo mode included)
- 📁 **FIT File Support**: Upload FIT files from your GPS device or watch
- 🌓 **Dark Mode**: Fully responsive design with dark mode support
- ⚡ **Fast**: Built with Next.js 16 for optimal performance

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ryanvalle/running-route-analyzer.git
cd running-route-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure API credentials for enhanced features:
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API credentials:
# STRAVA_CLIENT_ID=your_client_id
# STRAVA_CLIENT_SECRET=your_client_secret
# STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
# OPENAI_API_KEY=your_openai_api_key
```

**Strava API** (for real activity data):
- Go to https://www.strava.com/settings/api
- Create a new application
- Use `http://localhost:3000/api/auth/strava/callback` as the Authorization Callback Domain
- Copy the Client ID and Client Secret to your `.env.local` file

**OpenAI API** (for AI coaching insights):
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy the API key to your `.env.local` file
- Note: The app works without this, but AI coaching insights will not be available

**Resend API** (for email reports):
- Go to https://resend.com and sign up for a free account (100 emails/day)
- Create a new API key
- Copy the API key to your `.env.local` file
- Note: Email report feature requires this configuration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. (Optional) Add environment variables in Vercel project settings:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI` (e.g., `https://your-domain.vercel.app/api/auth/strava/callback`)
   - `OPENAI_API_KEY` (for AI coaching insights)
   - `RESEND_API_KEY` (for email reports - get free key at [resend.com](https://resend.com))
5. Update your Strava API application's Authorization Callback Domain to match your Vercel domain
6. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryanvalle/running-route-analyzer)

## Usage

### Analyzing a Strava Activity

#### With OAuth (Real Strava Data)
If you've configured Strava API credentials:
1. Visit `/api/auth/strava` to authenticate with your Strava account
2. Authorize the application to access your Strava activities
3. Once authenticated, go to any Strava activity page
4. Copy the activity URL (e.g., `https://www.strava.com/activities/123456`)
5. Paste it into the "From Strava Activity" input field
6. Click "Analyze" to get real GPS and elevation data

#### Demo Mode
Without Strava API credentials configured:
1. Copy any Strava activity URL (e.g., `https://www.strava.com/activities/123456`)
2. Paste it into the "From Strava Activity" input field
3. Click "Analyze"
4. The app will generate mock data for demonstration purposes

### Uploading a FIT File

1. Export a FIT file from your GPS watch or running app
2. Click "Upload FIT File" or drag and drop the file
3. The app will automatically parse and analyze the route

## How It Works

The analyzer:
1. Extracts GPS coordinates and elevation data from the route
2. Segments the route into mile-based intervals
3. Calculates elevation gain, loss, and average grade for each segment
4. Generates a natural language summary of the terrain
5. (Optional) Sends route data to OpenAI for AI-powered coaching insights
6. Presents the data in an easy-to-read format with interactive visualizations

Example output:
- "The first 3 miles will be relatively flat"
- "Expect elevation gain starting at mile 4"
- Mile-by-mile breakdown with grade percentages
- AI coaching recommendations for pacing and effort management

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **FIT File Parsing**: fit-file-parser
- **Strava Integration**: Strava API v3 with OAuth 2.0

## Project Structure

```
running-route-analyzer/
├── app/
│   ├── api/
│   │   ├── analyze/           # Route analysis endpoint
│   │   ├── auth/
│   │   │   └── strava/        # Strava OAuth endpoints
│   │   ├── fit-upload/        # FIT file upload handler
│   │   └── strava/            # Strava API integration
│   ├── layout.tsx
│   └── page.tsx               # Main application page
├── components/
│   ├── FileUpload.tsx           # FIT file upload component
│   ├── StravaInput.tsx          # Strava URL input component
│   └── RouteAnalysisDisplay.tsx # Analysis results display
├── lib/
│   └── routeAnalysis.ts  # Core route analysis logic
├── types/
│   └── index.ts          # TypeScript type definitions
└── public/               # Static assets
```

## API Endpoints

### POST `/api/analyze`
Analyzes route points and returns elevation profile.

**Request:**
```json
{
  "points": [
    {
      "lat": 37.7749,
      "lng": -122.4194,
      "elevation": 100,
      "distance": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "totalDistance": 5.0,
    "totalElevationGain": 500,
    "totalElevationLoss": 450,
    "segments": [...],
    "summary": "The first 3 miles will be relatively flat..."
  }
}
```

### POST `/api/fit-upload`
Uploads and parses a FIT file.

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "points": [...],
  "totalPoints": 1000
}
```

### GET `/api/auth/strava`
Initiates Strava OAuth flow. Redirects user to Strava authorization page.

### GET `/api/auth/strava/callback`
Handles OAuth callback from Strava. Exchanges authorization code for access tokens and stores them in secure HTTP-only cookies.

### POST `/api/strava`
Fetches route data from Strava activity. Uses OAuth tokens if configured, otherwise returns demo data.

**Request:**
```json
{
  "activityUrl": "https://www.strava.com/activities/123456"
}
```

**Response (with OAuth):**
```json
{
  "success": true,
  "points": [...],
  "demo": false,
  "activityId": "123456",
  "activityName": "Morning Run"
}
```

**Response (demo mode):**
```json
{
  "success": true,
  "points": [...],
  "demo": true,
  "message": "Using demo data. To use real Strava data, configure Strava API credentials."
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
