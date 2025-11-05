import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolves a URL by following redirects to get the final destination URL
 * @param url - The URL to resolve (can be a short link)
 * @returns The final resolved URL after following redirects
 */
async function resolveUrl(url: string): Promise<string> {
  try {
    // Check if this is a Strava short link (normalize to lowercase for case-insensitive comparison)
    const normalizedUrl = url.toLowerCase();
    if (normalizedUrl.startsWith('https://strava.app.link/') || normalizedUrl.startsWith('http://strava.app.link/')) {
      // Validate the URL format before making the request (SSRF protection)
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        // If URL parsing fails, return the original URL
        return url;
      }
      
      // Only allow strava.app.link domain to prevent SSRF attacks
      if (parsedUrl.hostname.toLowerCase() !== 'strava.app.link') {
        return url;
      }
      
      // Follow the redirect to get the final URL with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; StravaAnalyzer/1.0)',
          },
        });
        
        clearTimeout(timeoutId);
        
        // Validate that the resolved URL is a Strava domain for additional security
        const resolvedUrl = response.url;
        console.log('Short link resolved to:', resolvedUrl);
        
        const resolvedParsedUrl = new URL(resolvedUrl);
        const hostname = resolvedParsedUrl.hostname.toLowerCase();
        
        // Only allow exact strava.com or legitimate *.strava.com subdomains
        // Use split to ensure we're checking the actual domain components
        const parts = hostname.split('.');
        const isValidStravaDomain = 
          hostname === 'strava.com' || 
          hostname === 'www.strava.com' ||
          (parts.length >= 2 && parts[parts.length - 2] === 'strava' && parts[parts.length - 1] === 'com');
        
        if (isValidStravaDomain) {
          return resolvedUrl;
        }
        
        console.warn('Resolved URL is not a valid Strava domain:', hostname);
        // If the resolved URL is not a Strava domain, return the original URL
        return url;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Failed to resolve short link:', fetchError);
        throw fetchError;
      }
    }
    
    // For regular URLs, return as-is
    return url;
  } catch (error) {
    console.error('Error resolving URL:', error);
    // If resolution fails, return the original URL
    return url;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { activityUrl } = await request.json();

    if (!activityUrl) {
      return NextResponse.json(
        { error: 'Activity URL is required' },
        { status: 400 }
      );
    }

    // Resolve the URL in case it's a short link
    const resolvedUrl = await resolveUrl(activityUrl);
    console.log('Processing URL:', activityUrl, '-> Resolved to:', resolvedUrl);

    // Extract activity ID from URL
    // This regex validates that the activity ID contains only digits, preventing injection attacks
    const activityIdMatch = resolvedUrl.match(/activities\/(\d+)/);
    if (!activityIdMatch) {
      console.error('Failed to extract activity ID from URL:', resolvedUrl);
      return NextResponse.json(
        { error: `Invalid Strava activity URL. Could not extract activity ID from: ${resolvedUrl}` },
        { status: 400 }
      );
    }

    const activityId = activityIdMatch[1];
    
    // Additional validation: ensure activity ID is a valid positive integer
    if (!activityId || parseInt(activityId) <= 0) {
      return NextResponse.json(
        { error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

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
        athleteId: '0',
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

    // Fetch activity data from Strava API
    // The activityId has been validated to contain only digits, and requests are made
    // exclusively to the official Strava API domain. Access is controlled by OAuth tokens.
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

    // Fetch detailed activity stream for elevation and GPS data from Strava API
    // All requests are made to the hardcoded Strava API domain with validated activity IDs
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
      athleteId: activityData.athlete?.id || 0,
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
