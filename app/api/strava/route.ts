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

    // Note: In production, you would need to implement OAuth flow
    // For now, return mock data for demonstration
    return NextResponse.json({
      success: true,
      points: generateMockStravaData(),
      demo: true,
      message: 'Using demo data. To use real Strava data, configure Strava API credentials.',
      activityId,
    });
  } catch (error) {
    console.error('Error fetching Strava activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Strava activity' },
      { status: 500 }
    );
  }
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
