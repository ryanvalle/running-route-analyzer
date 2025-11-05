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
- Written in a conversational, supportive coaching tone`;

export const FITNESS_COACH_USER_PROMPT_TEMPLATE = `Please analyze this running route and provide coaching insights:

**Route Statistics:**
- Total Distance: {totalDistance} miles
- Total Elevation Gain: {totalElevationGain} feet
- Total Elevation Loss: {totalElevationLoss} feet

**Mile-by-Mile Breakdown:**
{segmentDetails}

Based on this data, please provide:

1. **Route Overview**: A brief summary describing whether this is a relatively flat, hilly, or mixed terrain route. Mention any specific miles where terrain changes significantly (e.g., "mostly flat but expect hills around mile 4").

2. **Key Features** (as a bullet list):
   - Notable elevation changes or challenging sections
   - Any patterns in the terrain (gradual climbs, steep descents, rolling hills)
   - Mention specific mile markers for important transitions
   - Note any opportunities for recovery (flat or downhill sections after climbs)

3. **Pacing & Effort Strategy**:
   - Recommendations for how to manage effort throughout the course
   - Specific advice for tackling climbs and utilizing descents
   - Tips to help finish strong (energy conservation, when to push, when to hold back)
   - Any mental preparation advice for challenging sections

Keep your response focused, practical, and motivating. Format your response clearly with the three sections above.`;

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
