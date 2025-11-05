import { NextRequest, NextResponse } from 'next/server';
import { analyzeRoute } from '@/lib/routeAnalysis';
import { getAICoachingInsights } from '@/lib/openai';
import { RoutePoint } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { points, activityId } = await request.json();

    if (!points || !Array.isArray(points) || points.length === 0) {
      return NextResponse.json(
        { error: 'Valid route points are required' },
        { status: 400 }
      );
    }

    // Validate point structure
    const validPoints = points.every(
      (p: unknown): p is RoutePoint => {
        const point = p as RoutePoint;
        return (
          typeof point.lat === 'number' &&
          typeof point.lng === 'number' &&
          typeof point.elevation === 'number' &&
          typeof point.distance === 'number'
        );
      }
    );

    if (!validPoints) {
      return NextResponse.json(
        { error: 'Invalid point data structure' },
        { status: 400 }
      );
    }

    const analysis = analyzeRoute(points as RoutePoint[]);

    // Get AI coaching insights if OpenAI is configured
    // Pass activityId for caching if available
    const aiCoachingInsights = await getAICoachingInsights(analysis, activityId);

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        points: points as RoutePoint[],
        aiCoachingInsights: aiCoachingInsights || undefined,
      },
    });
  } catch (error) {
    console.error('Error analyzing route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze route' },
      { status: 500 }
    );
  }
}
