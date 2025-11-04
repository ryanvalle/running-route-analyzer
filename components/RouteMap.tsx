'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint, RouteSegment } from '@/types';
import { METERS_TO_MILES } from '@/lib/constants';

interface RouteMapProps {
  points: RoutePoint[];
  segments: RouteSegment[];
  hoveredSegmentIndex: number | null;
}

// Component to fit map bounds to route
function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

export default function RouteMap({ points, segments, hoveredSegmentIndex }: RouteMapProps) {
  // Convert RoutePoint[] to LatLng pairs for the full route
  const routePath = useMemo(() => {
    return points.map(p => [p.lat, p.lng] as [number, number]);
  }, [points]);

  // Calculate bounds for the map
  const bounds = useMemo(() => {
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    return new LatLngBounds(latLngs);
  }, [points]);

  // Pre-calculate segment paths for better performance
  const segmentPaths = useMemo(() => {
    return segments.map(segment => {
      const segmentPoints = points.filter(p => {
        const mile = p.distance * METERS_TO_MILES;
        return mile >= segment.startMile && mile < segment.endMile;
      });
      return segmentPoints.map(p => [p.lat, p.lng] as [number, number]);
    });
  }, [segments, points]);

  // Get the path for the hovered segment
  const hoveredSegmentPath = useMemo(() => {
    if (hoveredSegmentIndex === null || !segmentPaths[hoveredSegmentIndex]) {
      return null;
    }
    return segmentPaths[hoveredSegmentIndex];
  }, [hoveredSegmentIndex, segmentPaths]);

  if (points.length === 0) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No route data available</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds bounds={bounds} />
        
        {/* Main route path */}
        <Polyline
          positions={routePath}
          pathOptions={{
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7,
          }}
        />
        
        {/* Highlighted segment path */}
        {hoveredSegmentPath && hoveredSegmentPath.length > 0 && (
          <Polyline
            positions={hoveredSegmentPath}
            pathOptions={{
              color: '#ef4444',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
