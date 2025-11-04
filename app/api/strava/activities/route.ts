import { NextRequest, NextResponse } from 'next/server';

// Fetch recent activities from Strava
export async function GET(request: NextRequest) {
  try {
    // Check if we have Strava credentials configured
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Strava API not configured' },
        { status: 500 }
      );
    }

    // Get access token from cookies
    const accessToken = request.cookies.get('strava_access_token')?.value;
    const expiresAt = request.cookies.get('strava_expires_at')?.value;
    const refreshToken = request.cookies.get('strava_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Strava', authRequired: true },
        { status: 401 }
      );
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
          return NextResponse.json(
            { error: 'Token refresh failed. Please re-authenticate.', authRequired: true },
            { status: 401 }
          );
        }
      }
    }

    // Fetch activities from Strava API
    // Get up to 30 most recent activities (we'll filter for runs and races on the client)
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=30',
      {
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      if (activitiesResponse.status === 401) {
        return NextResponse.json(
          { error: 'Strava authentication failed. Please re-authenticate.', authRequired: true },
          { status: 401 }
        );
      }
      throw new Error(`Strava API error: ${activitiesResponse.status}`);
    }

    const activities = await activitiesResponse.json();

    // Define the activity type
    interface StravaActivity {
      id: number;
      name: string;
      distance: number;
      start_date: string;
      elapsed_time: number;
      type: string;
      workout_type: number | null;
    }

    // Filter for Run and Race activities and format the response
    const runActivities = (activities as StravaActivity[])
      .filter((activity) => activity.type === 'Run')
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        distance: activity.distance,
        start_date: activity.start_date,
        elapsed_time: activity.elapsed_time,
        type: activity.type,
        workout_type: activity.workout_type, // workout_type 1 = Race, 0 or null = Regular run
      }));

    const response = NextResponse.json({
      success: true,
      activities: runActivities,
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
    console.error('Error fetching Strava activities:', error);
    
    // Return mock data for development/testing if we can't reach Strava
    if (process.env.NODE_ENV === 'development') {
      const mockActivities = [
        {
          id: 12345678901,
          name: 'Morning Run',
          distance: 8047,
          start_date: '2024-11-01T08:00:00Z',
          elapsed_time: 2400,
          type: 'Run',
          workout_type: 0,
        },
        {
          id: 12345678902,
          name: 'Easy Recovery Run',
          distance: 5000,
          start_date: '2024-10-30T17:00:00Z',
          elapsed_time: 1800,
          type: 'Run',
          workout_type: 0,
        },
        {
          id: 12345678903,
          name: 'Long Run',
          distance: 16093,
          start_date: '2024-10-28T07:00:00Z',
          elapsed_time: 5400,
          type: 'Run',
          workout_type: 0,
        },
        {
          id: 12345678904,
          name: 'Tempo Run',
          distance: 10000,
          start_date: '2024-10-26T06:00:00Z',
          elapsed_time: 2700,
          type: 'Run',
          workout_type: 0,
        },
        {
          id: 12345678905,
          name: 'Easy Run',
          distance: 6437,
          start_date: '2024-10-24T18:00:00Z',
          elapsed_time: 2100,
          type: 'Run',
          workout_type: 0,
        },
        {
          id: 12345678906,
          name: '5K Race',
          distance: 5000,
          start_date: '2024-10-20T09:00:00Z',
          elapsed_time: 1200,
          type: 'Run',
          workout_type: 1,
        },
        {
          id: 12345678907,
          name: 'Half Marathon',
          distance: 21097,
          start_date: '2024-10-13T08:00:00Z',
          elapsed_time: 6300,
          type: 'Run',
          workout_type: 1,
        },
        {
          id: 12345678908,
          name: '10K Race',
          distance: 10000,
          start_date: '2024-09-29T09:00:00Z',
          elapsed_time: 2400,
          type: 'Run',
          workout_type: 1,
        },
      ];
      
      return NextResponse.json({
        success: true,
        activities: mockActivities,
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Strava activities' },
      { status: 500 }
    );
  }
}
