import { NextRequest, NextResponse } from 'next/server';
import GPX from 'gpx-parser-builder';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.gpx')) {
      return NextResponse.json(
        { error: 'File must be a .gpx file' },
        { status: 400 }
      );
    }

    // Read file as text
    const text = await file.text();

    // Parse GPX file
    const gpx = GPX.parse(text);

    if (!gpx) {
      return NextResponse.json(
        { error: 'Failed to parse GPX file' },
        { status: 400 }
      );
    }

    // Extract track points from all tracks and segments
    const allPoints: Array<{ lat: number; lng: number; elevation: number; distance: number }> = [];
    let totalDistance = 0;

    if (!gpx.trk || gpx.trk.length === 0) {
      return NextResponse.json(
        { error: 'No track data found in GPX file' },
        { status: 400 }
      );
    }

    // Process all tracks
    for (const track of gpx.trk) {
      if (!track.trkseg || track.trkseg.length === 0) continue;

      // Process all track segments
      for (const segment of track.trkseg) {
        if (!segment.trkpt || segment.trkpt.length === 0) continue;

        // Process all track points
        for (let i = 0; i < segment.trkpt.length; i++) {
          const point = segment.trkpt[i];
          
          // Extract lat, lon, and elevation
          const lat = parseNumber(point.$.lat);
          const lng = parseNumber(point.$.lon);
          const elevation = point.ele ? parseNumber(point.ele) : undefined;

          if (isNaN(lat) || isNaN(lng)) continue;
          if (elevation === undefined || isNaN(elevation)) continue;

          // Calculate distance from previous point if not the first point
          if (allPoints.length > 0) {
            const prevPoint = allPoints[allPoints.length - 1];
            const distance = calculateDistance(
              prevPoint.lat,
              prevPoint.lng,
              lat,
              lng
            );
            totalDistance += distance;
          }

          allPoints.push({
            lat,
            lng,
            elevation,
            distance: totalDistance,
          });
        }
      }
    }

    if (allPoints.length === 0) {
      return NextResponse.json(
        { error: 'No valid GPS data with elevation found in GPX file' },
        { status: 400 }
      );
    }

    // Debug: Log elevation range
    const elevations = allPoints.map(p => p.elevation);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    console.log(`Elevation range: ${minElev}m to ${maxElev}m`);
    console.log(`Total points with elevation: ${allPoints.length}`);
    console.log(`Total distance: ${totalDistance}m`);

    return NextResponse.json({
      success: true,
      points: allPoints,
      totalPoints: allPoints.length,
    });
  } catch (error) {
    console.error('Error processing GPX file:', error);
    return NextResponse.json(
      { error: 'Failed to process GPX file' },
      { status: 500 }
    );
  }
}

// Helper function to parse string or number values to float
function parseNumber(value: string | number): number {
  return parseFloat(String(value));
}

// Haversine formula to calculate distance between two GPS coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
