import { NextRequest, NextResponse } from 'next/server';

// Track when the server started
const startTime = Date.now();

export async function GET(request: NextRequest) {
  try {
    // Calculate uptime
    const uptimeMs = Date.now() - startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    
    // Check which optional services are configured
    const services = {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        status: process.env.OPENAI_API_KEY ? 'available' : 'not configured'
      },
      strava: {
        configured: !!(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET),
        status: (process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET) ? 'available' : 'not configured'
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        status: process.env.RESEND_API_KEY ? 'available' : 'not configured'
      }
    };

    // Determine overall status
    const status = 'healthy';

    const healthResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      uptime: {
        seconds: uptimeSeconds,
        human: formatUptime(uptimeSeconds)
      },
      services
    };

    return NextResponse.json(healthResponse, { status: 200 });
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}

// Helper function to format uptime in human-readable format
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
