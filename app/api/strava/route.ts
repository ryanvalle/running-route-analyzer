import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { activityUrl } = await request.json();

    if (!activityUrl) {
      return NextResponse.json(
        { error: 'Activity URL is required' },
        { status: 400 }
      );
    }

    // Extract activity ID from URL
    const activityIdMatch = activityUrl.match(/activities\/(\d+)/);
    if (!activityIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Strava activity URL' },
        { status: 400 }
      );
    }

    const activityId = activityIdMatch[1];

    // Check if we have Strava credentials configured
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // Return mock data if credentials not configured
      return NextResponse.json({
        success: true,
        points: generateMockStravaData(),
        demo: true,
        message: 'Using demo data. To use real Strava data, configure Strava API credentials.',
        activityId,
      });
    }

    // Get access token from cookies
    const accessToken = request.cookies.get('strava_access_token')?.value;
    const expiresAt = request.cookies.get('strava_expires_at')?.value;
    const refreshToken = request.cookies.get('strava_refresh_token')?.value;

    // Check if user is authenticated
    if (!accessToken) {
      return NextResponse.json({
        error: 'Not authenticated with Strava',
        authRequired: true,
        authUrl: '/api/auth/strava',
      }, { status: 401 });
    }

    // Check if token is expired and refresh if needed
    let currentAccessToken = accessToken;
    let newTokenData = null;
    if (expiresAt && refreshToken) {
      const expirationTime = parseInt(expiresAt);
      const now = Math.floor(Date.now() / 1000);
      
      if (now >= expirationTime) {
        // Token expired, refresh it
        const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        if (refreshResponse.ok) {
          newTokenData = await refreshResponse.json();
          currentAccessToken = newTokenData.access_token;
        } else {
          return NextResponse.json({
            error: 'Token refresh failed. Please re-authenticate.',
            authRequired: true,
            authUrl: '/api/auth/strava',
          }, { status: 401 });
        }
      }
    }

    // Fetch activity data from Strava
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
        },
      }
    );

    if (!activityResponse.ok) {
      if (activityResponse.status === 401) {
        return NextResponse.json({
          error: 'Strava authentication failed. Please re-authenticate.',
          authRequired: true,
          authUrl: '/api/auth/strava',
        }, { status: 401 });
      }
      throw new Error(`Strava API error: ${activityResponse.status}`);
    }

    const activityData = await activityResponse.json();

    // Fetch detailed activity stream for elevation and GPS data
    const streamResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,distance,altitude&key_by_type=true`,
      {
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
        },
      }
    );

    if (!streamResponse.ok) {
      throw new Error(`Failed to fetch activity streams: ${streamResponse.status}`);
    }

    const streamData = await streamResponse.json();

    // Convert Strava stream data to our RoutePoint format
    const points = convertStravaStreamToPoints(streamData);

    const response = NextResponse.json({
      success: true,
      points,
      demo: false,
      activityId,
      activityName: activityData.name,
    });

    // If we refreshed the token, update the cookies in the response
    if (newTokenData) {
      response.cookies.set('strava_access_token', newTokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 6, // 6 hours
      });

      response.cookies.set('strava_refresh_token', newTokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      response.cookies.set('strava_expires_at', newTokenData.expires_at.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Error fetching Strava activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Strava activity' },
      { status: 500 }
    );
  }
}

// Define type for Strava stream data
interface StravaStreamData {
  latlng?: { data: [number, number][] };
  distance?: { data: number[] };
  altitude?: { data: number[] };
}

// Convert Strava stream data to RoutePoint format
function convertStravaStreamToPoints(streamData: StravaStreamData) {
  const latlng = streamData.latlng?.data || [];
  const distance = streamData.distance?.data || [];
  const altitude = streamData.altitude?.data || [];

  const points = [];
  const length = Math.min(latlng.length, distance.length, altitude.length);

  for (let i = 0; i < length; i++) {
    points.push({
      lat: latlng[i][0],
      lng: latlng[i][1],
      elevation: altitude[i],
      distance: distance[i],
    });
  }

  return points;
}

// Generate mock data for demonstration
function generateMockStravaData() {
  const points = [];
  const totalDistance = 5000; // 5km in meters
  const numPoints = 100;

  for (let i = 0; i < numPoints; i++) {
    const distance = (i / numPoints) * totalDistance;
    let elevation = 100; // Start at 100m
    
    // Create varied terrain
    if (distance < 1500) {
      // First ~1 mile: relatively flat
      elevation += Math.sin(distance / 200) * 5;
    } else if (distance < 3500) {
      // Miles 1-2: climbing
      elevation += 50 + (distance - 1500) * 0.03;
    } else {
      // After mile 2: descent
      elevation += 110 - (distance - 3500) * 0.02;
    }

    points.push({
      lat: 37.7749 + (i * 0.0001),
      lng: -122.4194 + (i * 0.0001),
      elevation,
      distance,
    });
  }

  return points;
}
