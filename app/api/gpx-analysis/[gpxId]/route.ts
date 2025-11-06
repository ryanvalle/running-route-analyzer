import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

interface RouteParams {
  params: Promise<{
    gpxId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { gpxId } = await params;

    // Retrieve data from cache
    const cachedData = cache.get(`gpx:${gpxId}`);

    if (!cachedData) {
      return NextResponse.json(
        { error: 'GPX analysis not found or has expired. GPX uploads are cached for 1 hour.' },
        { status: 404 }
      );
    }

    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('Error retrieving GPX analysis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve GPX analysis' },
      { status: 500 }
    );
  }
}
