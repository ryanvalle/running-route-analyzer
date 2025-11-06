export type DistanceUnit = 'miles' | 'kilometers';
export type SegmentIncrement = 0.25 | 0.5 | 1;

export interface RouteSegment {
  startMile: number;
  endMile: number;
  elevationGain: number;
  elevationLoss: number;
  avgGrade: number;
  description: string;
}

export interface RouteAnalysis {
  totalDistance: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  segments: RouteSegment[];
  summary: string;
  points?: RoutePoint[];
  aiCoachingInsights?: string;
  unit?: DistanceUnit;
  increment?: SegmentIncrement;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  elevation: number;
  distance: number;
}
