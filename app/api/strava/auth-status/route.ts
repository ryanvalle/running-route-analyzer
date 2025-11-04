import { NextRequest, NextResponse } from 'next/server';

// Check if user is authenticated with Strava
export async function GET(request: NextRequest) {
  try {
    // Check if we have Strava credentials configured
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        authenticated: false,
        configured: false,
        message: 'Strava API not configured',
      });
    }

    // Get access token from cookies
    const accessToken = request.cookies.get('strava_access_token')?.value;
    const expiresAt = request.cookies.get('strava_expires_at')?.value;

    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        configured: true,
      });
    }

    // Check if token is expired
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt);
      const now = Math.floor(Date.now() / 1000);
      
      if (now >= expirationTime) {
        return NextResponse.json({
          authenticated: false,
          configured: true,
          expired: true,
        });
      }
    }

    return NextResponse.json({
      authenticated: true,
      configured: true,
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}
