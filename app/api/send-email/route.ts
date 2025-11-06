import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RouteAnalysis } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      analysis, 
      mapImage, 
      chartImage 
    }: { 
      email: string; 
      analysis: RouteAnalysis; 
      mapImage: string; 
      chartImage: string;
    } = body;

    // Log image data for debugging
    console.log('Email API received images:');
    console.log('- Map image length:', mapImage?.length || 0);
    console.log('- Chart image length:', chartImage?.length || 0);
    console.log('- Map image starts with data:image/png:', mapImage?.startsWith('data:image/png'));
    console.log('- Chart image starts with data:image/png:', chartImage?.startsWith('data:image/png'));

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.',
          instructions: 'Get a free API key at https://resend.com'
        },
        { status: 500 }
      );
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate HTML email content
    const htmlContent = generateEmailHTML(analysis, mapImage, chartImage);

    // Send email using Resend
    const { data, error: sendError } = await resend.emails.send({
      from: 'Route Analyzer <onboarding@resend.dev>', // Resend test domain
      to: [email],
      subject: `Route Analysis - ${analysis.totalDistance.toFixed(2)} miles`,
      html: htmlContent,
    });

    if (sendError) {
      throw new Error(sendError.message || 'Failed to send email via Resend');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: data?.id 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateEmailHTML(analysis: RouteAnalysis, mapImage: string, chartImage: string): string {
  const segmentsHTML = analysis.segments.map(segment => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-weight: 500;">Mile ${segment.startMile.toFixed(1)} - ${segment.endMile.toFixed(1)}</td>
      <td style="padding: 12px;">${segment.description}</td>
      <td style="padding: 12px; text-align: center;">
        <span style="
          padding: 4px 12px; 
          border-radius: 12px; 
          font-weight: 500;
          ${Math.abs(segment.avgGrade) < 1 
            ? 'background-color: #f3f4f6; color: #374151;' 
            : segment.avgGrade > 0
            ? 'background-color: #d1fae5; color: #065f46;'
            : 'background-color: #fee2e2; color: #991b1b;'
          }
        ">
          ${segment.avgGrade > 0 ? '+' : ''}${segment.avgGrade.toFixed(1)}%
        </span>
      </td>
      <td style="padding: 12px; text-align: right;">${Math.round(segment.elevationGain)} ft</td>
      <td style="padding: 12px; text-align: right;">${Math.round(segment.elevationLoss)} ft</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Route Analysis</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 32px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">
            Route Analysis Report
          </h1>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">
            Detailed elevation profile and terrain breakdown
          </p>
        </div>

        <!-- Summary Section -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
            Route Summary
          </h2>
          <p style="color: #374151; margin: 0;">
            ${analysis.summary}
          </p>
        </div>

        ${analysis.aiCoachingInsights ? `
        <!-- AI Coaching Insights -->
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%); border: 2px solid #a78bfa; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="background-color: #7c3aed; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <span style="color: white; font-size: 18px;">⚡</span>
            </div>
            <div>
              <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0;">
                AI Coaching Insights
              </h2>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Personalized strategy and recommendations
              </p>
            </div>
          </div>
          <div style="color: #374151;">
            ${analysis.aiCoachingInsights}
          </div>
        </div>
        ` : ''}

        <!-- Overall Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Total Distance</p>
            <p style="font-size: 24px; font-weight: bold; color: #111827; margin: 0;">
              ${analysis.totalDistance.toFixed(2)} mi
            </p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Elevation Gain</p>
            <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0;">
              +${Math.round(analysis.totalElevationGain)} ft
            </p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Elevation Loss</p>
            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">
              -${Math.round(analysis.totalElevationLoss)} ft
            </p>
          </div>
        </div>

        <!-- Elevation Chart -->
        ${chartImage ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
            Elevation Profile
          </h2>
          <img src="${chartImage}" alt="Elevation Chart" style="width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 8px;" />
        </div>
        ` : ''}

        <!-- Route Map -->
        ${mapImage ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
            Route Map
          </h2>
          <img src="${mapImage}" alt="Route Map" style="width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 8px;" />
        </div>
        ` : ''}

        <!-- Mile-by-Mile Breakdown -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
            Mile-by-Mile Breakdown
          </h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Mile</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Description</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Grade</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Gain</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Loss</th>
              </tr>
            </thead>
            <tbody>
              ${segmentsHTML}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">Generated by Route Analyzer</p>
          <p style="margin: 0;">This is a static snapshot of your route analysis.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
