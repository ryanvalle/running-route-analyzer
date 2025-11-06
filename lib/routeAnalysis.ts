import { RouteAnalysis, RoutePoint, RouteSegment, DistanceUnit, SegmentIncrement } from '@/types';
import { METERS_TO_MILES, METERS_TO_KILOMETERS, FEET_PER_METER } from './constants';

export function analyzeRoute(
  points: RoutePoint[], 
  unit: DistanceUnit = 'miles',
  increment: SegmentIncrement = 1
): RouteAnalysis {
  if (!points || points.length === 0) {
    return {
      totalDistance: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      segments: [],
      summary: 'No route data available',
      unit,
      increment,
    };
  }

  const conversionFactor = unit === 'miles' ? METERS_TO_MILES : METERS_TO_KILOMETERS;
  const totalDistance = points[points.length - 1].distance * conversionFactor;
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

  // Create segments based on selected unit and increment
  const segments: RouteSegment[] = [];
  const segmentSize = increment;
  const numSegments = Math.ceil(totalDistance / segmentSize);
  
  // Maintain a running index to avoid rescanning points (O(n) instead of O(n*m))
  let currentPointIndex = 0;

  for (let i = 0; i < numSegments; i++) {
    const startMile = i * segmentSize;
    const endMile = Math.min((i + 1) * segmentSize, totalDistance);
    
    // Find all points in this segment, including one point beyond the end
    // to properly capture elevation changes at segment boundaries
    const segmentPoints: RoutePoint[] = [];
    let firstPointBeyondEnd: RoutePoint | null = null;
    
    // Start from the previous segment's ending point
    let j = currentPointIndex;
    
    // Skip points before this segment starts
    while (j < points.length) {
      const distance = points[j].distance * conversionFactor;
      if (distance >= startMile || (i > 0 && distance > startMile)) {
        break;
      }
      j++;
    }
    
    // Update current index for next segment
    currentPointIndex = j;
    
    // Collect points for this segment
    while (j < points.length) {
      const distance = points[j].distance * conversionFactor;
      
      // For the first segment, include points >= startMile
      // For subsequent segments, include points > startMile to avoid double-counting
      const includeStart = (i === 0 && distance >= startMile) || (i > 0 && distance > startMile);
      
      // Include all points within the segment
      if (includeStart && distance <= endMile) {
        segmentPoints.push(points[j]);
        j++;
      }
      // Capture the first point beyond the segment end to include elevation changes at the boundary
      else if (distance > endMile) {
        firstPointBeyondEnd = points[j];
        break;
      } else {
        j++;
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
    if (avgGrade < 0.5 && avgGrade > -0.5) {
      description = 'Relatively flat';
    } else if (avgGrade > 0.5) {
      if (avgGrade < 1) description = 'Gentle climb';
      else if (avgGrade < 3) description = 'Moderate climb';
      else description = 'Steep climb';
    } else {
      if (avgGrade > -1) description = 'Gentle descent';
      else if (avgGrade > -3) description = 'Moderate descent';
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
  const summary = generateSummary(segments, totalDistance, unit);

  return {
    totalDistance,
    totalElevationGain,
    totalElevationLoss,
    segments,
    summary,
    unit,
    increment,
  };
}

function generateSummary(segments: RouteSegment[], totalDistance: number, unit: DistanceUnit): string {
  const unitLabel = unit === 'miles' ? 'mile' : 'kilometer';
  const unitLabelPlural = unit === 'miles' ? 'miles' : 'kilometers';
  
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
          const distance = Math.round(segment.startMile);
          summaryParts.push(
            `The first ${distance} ${distance !== 1 ? unitLabelPlural : unitLabel} will be ${currentTerrain.toLowerCase()}`
          );
        }
      }
      
      currentTerrain = segment.description;
      currentTerrainStart = segment.startMile;
    }
    
    // Look for significant elevation changes
    if (segment.description.includes('climb') && !segments[i-1]?.description.includes('climb')) {
      summaryParts.push(
        `Expect elevation gain starting at ${unitLabel} ${Math.round(segment.startMile)}`
      );
    }
  }

  if (summaryParts.length === 0) {
    return `This ${totalDistance.toFixed(1)}-${unitLabel} route has varied terrain.`;
  }

  return summaryParts.join('. ') + '.';
}

export function metersToMiles(meters: number): number {
  return meters * METERS_TO_MILES;
}

export function metersToFeet(meters: number): number {
  return meters * FEET_PER_METER;
}
