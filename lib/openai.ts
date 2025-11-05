import OpenAI from 'openai';
import { FITNESS_COACH_SYSTEM_PROMPT, buildFitnessCoachPrompt } from './prompts/fitnessCoachPrompt';
import { RouteAnalysis } from '@/types';
import { cache, getCacheKey } from './cache';

/**
 * Get OpenAI client instance
 * Returns null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not configured. AI coaching insights will not be available.');
    return null;
  }
  
  return new OpenAI({
    apiKey,
  });
}

/**
 * Get AI coaching insights for a route analysis
 * Returns null if OpenAI is not configured or if there's an error
 * 
 * @param analysis - The route analysis data
 * @param activityId - Optional Strava activity ID for caching (1 hour TTL)
 */
export async function getAICoachingInsights(
  analysis: RouteAnalysis,
  activityId?: string | number
): Promise<string | null> {
  const client = getOpenAIClient();
  
  if (!client) {
    return null;
  }
  
  // Check cache if activityId is provided
  if (activityId) {
    const cacheKey = getCacheKey.aiCoachingInsights(activityId);
    const cached = cache.get<string>(cacheKey);
    
    if (cached) {
      console.log(`Using cached AI coaching insights for activity ${activityId}`);
      return cached;
    }
  }
  
  try {
    const userPrompt = buildFitnessCoachPrompt({
      totalDistance: analysis.totalDistance,
      totalElevationGain: analysis.totalElevationGain,
      totalElevationLoss: analysis.totalElevationLoss,
      segments: analysis.segments,
    });
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: FITNESS_COACH_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // Validate response structure
    if (!completion.choices || completion.choices.length === 0) {
      console.error('OpenAI returned no completion choices');
      return null;
    }
    
    const insights = completion.choices[0]?.message?.content;
    
    if (!insights) {
      console.error('No insights generated from OpenAI');
      return null;
    }
    
    // Cache the insights if activityId is provided
    if (activityId) {
      const cacheKey = getCacheKey.aiCoachingInsights(activityId);
      cache.set(cacheKey, insights);
      console.log(`Cached AI coaching insights for activity ${activityId}`);
    }
    
    return insights;
  } catch (error) {
    console.error('Error getting AI coaching insights:', error);
    return null;
  }
}
