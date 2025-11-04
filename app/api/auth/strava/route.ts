import { NextResponse } from 'next/server';

// Initiates the Strava OAuth flow
export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/auth/strava/callback';

  if (!clientId) {
    return NextResponse.json(
      { error: 'Strava API not configured' },
      { status: 500 }
    );
  }

  // Build the Strava authorization URL
  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'activity:read_all');

  // Redirect to Strava authorization page
  return NextResponse.redirect(authUrl.toString());
}
