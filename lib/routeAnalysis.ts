import { RouteAnalysis, RoutePoint, RouteSegment } from '@/types';
import { METERS_TO_MILES, FEET_PER_METER } from './constants';

export function analyzeRoute(points: RoutePoint[]): RouteAnalysis {
  if (!points || points.length === 0) {
    return {
      totalDistance: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      segments: [],
      summary: 'No route data available',
    };
  }

  const totalDistance = points[points.length - 1].distance * METERS_TO_MILES;
  let totalElevationGain = 0;
  let totalElevationLoss = 0;

  // Calculate total elevation changes
  for (let i = 1; i < points.length; i++) {
    const elevDiff = points[i].elevation - points[i - 1].elevation;
    if (elevDiff > 0) {
      totalElevationGain += elevDiff;
    } else {
      totalElevationLoss += Math.abs(elevDiff);
    }
  }

  totalElevationGain *= FEET_PER_METER;
  totalElevationLoss *= FEET_PER_METER;

  // Create mile-based segments
  const segments: RouteSegment[] = [];
  const milesPerSegment = 1;
  const numSegments = Math.ceil(totalDistance / milesPerSegment);

  for (let i = 0; i < numSegments; i++) {
    const startMile = i * milesPerSegment;
    const endMile = Math.min((i + 1) * milesPerSegment, totalDistance);
    
    // Find all points in this mile segment, including one point beyond the end
    // to properly capture elevation changes at segment boundaries
    const segmentPoints: RoutePoint[] = [];
    let firstPointBeyondEnd: RoutePoint | null = null;
    
    for (let j = 0; j < points.length; j++) {
      const mile = points[j].distance * METERS_TO_MILES;
      
      // For the first segment, include points >= startMile
      // For subsequent segments, include points > startMile to avoid double-counting
      const includeStart = (i === 0 && mile >= startMile) || (i > 0 && mile > startMile);
      
      // Include all points within the segment
      if (includeStart && mile <= endMile) {
        segmentPoints.push(points[j]);
      }
      // Capture the first point beyond the segment end to include elevation changes at the boundary
      else if (mile > endMile && firstPointBeyondEnd === null) {
        firstPointBeyondEnd = points[j];
        break;
      }
    }
    
    // Add the first point beyond the segment to capture boundary elevation changes
    if (firstPointBeyondEnd !== null) {
      segmentPoints.push(firstPointBeyondEnd);
    }

    if (segmentPoints.length < 2) continue;

    let elevGain = 0;
    let elevLoss = 0;

    for (let j = 1; j < segmentPoints.length; j++) {
      const diff = segmentPoints[j].elevation - segmentPoints[j - 1].elevation;
      if (diff > 0) elevGain += diff;
      else elevLoss += Math.abs(diff);
    }

    elevGain *= FEET_PER_METER;
    elevLoss *= FEET_PER_METER;

    const distanceInMeters = segmentPoints[segmentPoints.length - 1].distance - segmentPoints[0].distance;
    const netElevChange = (segmentPoints[segmentPoints.length - 1].elevation - segmentPoints[0].elevation) * FEET_PER_METER;
    const avgGrade = distanceInMeters > 0 ? (netElevChange / (distanceInMeters * FEET_PER_METER)) * 100 : 0;

    let description = '';
    if (Math.abs(avgGrade) < 1) {
      description = 'Relatively flat';
    } else if (avgGrade > 0) {
      if (avgGrade < 3) description = 'Gentle climb';
      else if (avgGrade < 6) description = 'Moderate climb';
      else description = 'Steep climb';
    } else {
      if (avgGrade > -3) description = 'Gentle descent';
      else if (avgGrade > -6) description = 'Moderate descent';
      else description = 'Steep descent';
    }

    segments.push({
      startMile,
      endMile,
      elevationGain: elevGain,
      elevationLoss: elevLoss,
      avgGrade,
      description,
    });
  }

  // Generate summary
  const summary = generateSummary(segments, totalDistance);

  return {
    totalDistance,
    totalElevationGain,
    totalElevationLoss,
    segments,
    summary,
  };
}

function generateSummary(segments: RouteSegment[], totalDistance: number): string {
  const summaryParts: string[] = [];
  
  let currentTerrainStart = 0;
  let currentTerrain = segments[0]?.description || '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isFlatOrGentle = segment.description.includes('flat') || segment.description.includes('Gentle');
    
    if (i === 0) continue;
    
    // Check for terrain changes
    if (segment.description !== currentTerrain) {
      if (currentTerrainStart === 0) {
        if (isFlatOrGentle && i <= 3) {
          summaryParts.push(
            `The first ${Math.round(segment.startMile)} mile${Math.round(segment.startMile) !== 1 ? 's' : ''} will be ${currentTerrain.toLowerCase()}`
          );
        }
      }
      
      currentTerrain = segment.description;
      currentTerrainStart = segment.startMile;
    }
    
    // Look for significant elevation changes
    if (segment.description.includes('climb') && !segments[i-1]?.description.includes('climb')) {
      summaryParts.push(
        `Expect elevation gain starting at mile ${Math.round(segment.startMile)}`
      );
    }
  }

  if (summaryParts.length === 0) {
    return `This ${totalDistance.toFixed(1)}-mile route has varied terrain.`;
  }

  return summaryParts.join('. ') + '.';
}

export function metersToMiles(meters: number): number {
  return meters * METERS_TO_MILES;
}

export function metersToFeet(meters: number): number {
  return meters * FEET_PER_METER;
}
