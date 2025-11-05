/**
 * Prompt template for the OpenAI fitness coach persona
 * This prompt configures the AI to act as an experienced running coach
 * analyzing route data and providing coaching insights
 */

export const FITNESS_COACH_SYSTEM_PROMPT = `You are an experienced fitness coach specializing in running and endurance training. Your role is to analyze running routes and provide practical, actionable coaching advice to help runners prepare for and execute their runs successfully.

When analyzing a route, you should:
1. Review the elevation profile and distance data
2. Identify key characteristics of the route (flat, hilly, mixed terrain)
3. Note significant features like drastic elevation changes, landmarks, road crossings, or public facilities
4. Provide strategic pacing and effort management recommendations

Your analysis should be:
- Practical and actionable
- Encouraging but realistic about challenges
- Focused on helping the runner finish strong
- Written in a conversational, supportive coaching tone

IMPORTANT: Format your response as clean, semantic HTML. Use <h3> for section headers, <p> for paragraphs, <ul> and <li> for bullet lists, and <strong> for emphasis. Do not include <html>, <head>, or <body> tags - only the content HTML that will be inserted into a div.`;

export const FITNESS_COACH_USER_PROMPT_TEMPLATE = `Please analyze this running route and provide coaching insights:

<strong>Route Statistics:</strong>
<ul>
<li>Total Distance: {totalDistance} miles</li>
<li>Total Elevation Gain: {totalElevationGain} feet</li>
<li>Total Elevation Loss: {totalElevationLoss} feet</li>
</ul>

<strong>Mile-by-Mile Breakdown:</strong>
<pre>{segmentDetails}</pre>

Based on this data, please provide your analysis in HTML format with the following structure:

<h3>Route Overview</h3>
<p>A brief summary describing whether this is a relatively flat, hilly, or mixed terrain route. Mention any specific miles where terrain changes significantly (e.g., "mostly flat but expect hills around mile 4").</p>

<h3>Key Features</h3>
<ul>
<li>Notable elevation changes or challenging sections</li>
<li>Any patterns in the terrain (gradual climbs, steep descents, rolling hills)</li>
<li>Mention specific mile markers for important transitions</li>
<li>Note any opportunities for recovery (flat or downhill sections after climbs)</li>
</ul>

<h3>Pacing & Effort Strategy</h3>
<p>Recommendations for how to manage effort throughout the course. Specific advice for tackling climbs and utilizing descents. Tips to help finish strong (energy conservation, when to push, when to hold back). Any mental preparation advice for challenging sections.</p>

Keep your response focused, practical, and motivating. Return ONLY the HTML content without any markdown formatting or code blocks.`;

export function buildFitnessCoachPrompt(routeData: {
  totalDistance: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  segments: Array<{
    startMile: number;
    endMile: number;
    elevationGain: number;
    elevationLoss: number;
    avgGrade: number;
    description: string;
  }>;
}): string {
  const segmentDetails = routeData.segments
    .map((segment) => {
      return `  Mile ${segment.startMile.toFixed(1)}-${segment.endMile.toFixed(1)}: ${segment.description} (${segment.avgGrade > 0 ? '+' : ''}${segment.avgGrade.toFixed(1)}% grade, +${Math.round(segment.elevationGain)}ft gain, -${Math.round(segment.elevationLoss)}ft loss)`;
    })
    .join('\n');

  return FITNESS_COACH_USER_PROMPT_TEMPLATE.replace('{totalDistance}', routeData.totalDistance.toFixed(2))
    .replace('{totalElevationGain}', Math.round(routeData.totalElevationGain).toString())
    .replace('{totalElevationLoss}', Math.round(routeData.totalElevationLoss).toString())
    .replace('{segmentDetails}', segmentDetails);
}
