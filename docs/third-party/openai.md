# OpenAI API Integration

## Overview

The Running Route Analyzer uses OpenAI's GPT-4o-mini model to generate personalized AI coaching insights for route analysis. The integration provides runners with strategic pacing recommendations, terrain analysis, and effort management tips based on elevation profiles.

## Setup Steps

### 1. Create an OpenAI Account

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up for an account or log in
3. Add payment method (API usage is pay-as-you-go)

### 2. Generate API Key

1. Navigate to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a descriptive name (e.g., "Route Analyzer")
4. **Important**: Copy the key immediately - you won't be able to see it again!

### 3. Configure Environment Variable

Add the following to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-proj-...your_key_here
```

**Production Deployment:**
Add the same environment variable to your hosting platform (e.g., Vercel project settings).

### 4. Monitor Usage

- Check usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up usage limits to avoid unexpected charges
- Typical cost per analysis: ~$0.001-0.003 (very minimal)

## Model Configuration

### Model Used
- **GPT-4o-mini** - Cost-effective model optimized for speed and efficiency
- Alternative: GPT-4o or GPT-3.5-turbo (change in `lib/openai.ts`)

### Request Parameters
```typescript
{
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: FITNESS_COACH_SYSTEM_PROMPT },
    { role: 'user', content: buildFitnessCoachPrompt(analysis) }
  ],
  temperature: 0.7,        // Balanced creativity and consistency
  max_tokens: 1000         // Approximately 750 words maximum
}
```

### Temperature Explained
- **0.7** provides a balance between:
  - **Creativity**: Varied and engaging coaching language
  - **Consistency**: Reliable and accurate elevation analysis

## Prompt Engineering

### System Prompt
**File:** `lib/prompts/fitnessCoachPrompt.ts`

**Purpose:** Defines the AI's role and response format

**Key Instructions:**
- Act as an experienced running coach
- Analyze elevation profiles and provide actionable advice
- Use conversational, supportive tone
- Format output as semantic HTML (h3, p, ul, li, strong tags)

**Full Prompt:**
```
You are an experienced fitness coach specializing in running and endurance training. Your role is to analyze running routes and provide practical, actionable coaching advice to help runners prepare for and execute their runs successfully.

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

IMPORTANT: Format your response as clean, semantic HTML...
```

### User Prompt Template
**Function:** `buildFitnessCoachPrompt(routeData)`

**Input Data:**
- Total distance (miles or km)
- Total elevation gain (feet)
- Total elevation loss (feet)
- Mile-by-mile breakdown with grades and descriptions

**Template Structure:**
```
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
<p>A brief summary describing whether this is a relatively flat, hilly, or mixed terrain route...</p>

<h3>Key Features</h3>
<ul>
<li>Notable elevation changes or challenging sections</li>
<li>Any patterns in the terrain...</li>
</ul>

<h3>Pacing & Effort Strategy</h3>
<p>Recommendations for how to manage effort throughout the course...</p>
```

## Integration Points

### API Function: `getAICoachingInsights()`
**File:** `lib/openai.ts`

**Purpose:** Generate AI coaching insights for route analysis

**Signature:**
```typescript
async function getAICoachingInsights(
  analysis: RouteAnalysis,
  activityId?: string | number
): Promise<string | null>
```

**Parameters:**
- `analysis`: RouteAnalysis object with segments and totals
- `activityId`: Optional ID for caching (1-hour TTL)

**Returns:**
- HTML-formatted coaching insights as string
- `null` if OpenAI not configured or error occurs

**Flow:**
1. Check if API key is configured
2. Check cache for existing insights (if activityId provided)
3. Build user prompt from route analysis data
4. Call OpenAI API with system and user prompts
5. Validate response structure
6. Cache insights (if activityId provided)
7. Return HTML string or null

**Caching:**
- Cache key: `ai:coaching:{activityId}`
- TTL: 1 hour (3600000ms)
- Prevents duplicate API calls for same activity

**Error Handling:**
- Returns `null` on any error
- Logs errors to console
- App continues to function without AI insights

### Client Configuration Check
**Function:** `getOpenAIClient()`

**Purpose:** Initialize OpenAI client or return null if not configured

**Returns:**
- OpenAI client instance if API key exists
- `null` if API key not configured

**Usage:**
```typescript
const client = getOpenAIClient();
if (!client) {
  console.warn('OpenAI API key not configured...');
  return null;
}
```

## API Route Integration

### `/api/analyze` (POST)
**File:** `app/api/analyze/route.ts`

**Uses OpenAI:**
```typescript
const aiCoachingInsights = await getAICoachingInsights(analysis, activityId);

const fullAnalysis = {
  ...analysis,
  points: points as RoutePoint[],
  aiCoachingInsights: aiCoachingInsights || undefined,
};
```

**Dependencies:**
- Environment: `OPENAI_API_KEY` (optional)
- Function: `getAICoachingInsights()` from `lib/openai.ts`
- Cache: Uses activity ID for caching when available

**Behavior:**
- If OpenAI configured: Generates and includes AI insights
- If not configured: Returns analysis without `aiCoachingInsights` field
- On error: Logs error and continues without AI insights

## Component Display

### RouteAnalysisDisplay Component
**File:** `components/RouteAnalysisDisplay.tsx`

**Displays AI Insights:**
```typescript
{analysis.aiCoachingInsights && (
  <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-purple-600 text-white p-2 rounded-full">
        ⚡
      </div>
      <div>
        <h2 className="text-xl font-semibold">AI Coaching Insights</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Personalized strategy and recommendations
        </p>
      </div>
    </div>
    <div 
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  </div>
)}
```

**Security:**
- Uses DOMPurify to sanitize HTML before rendering
- Prevents XSS attacks from malicious AI responses

## HTML Sanitization

### DOMPurify Integration
**Package:** `dompurify`

**Purpose:** Sanitize AI-generated HTML before rendering

**Usage:**
```typescript
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(analysis.aiCoachingInsights || '', {
  ALLOWED_TAGS: ['h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br'],
  ALLOWED_ATTR: [],
});
```

**Allowed Tags:**
- Headings: `h3`, `h4`
- Text: `p`, `strong`, `em`, `br`
- Lists: `ul`, `ol`, `li`

**Security:**
- Removes all attributes (no `style`, `class`, `onclick`, etc.)
- Removes script tags and dangerous content
- Allows only semantic HTML for content

## Cost Estimation

### Per-Request Cost
- **Model**: GPT-4o-mini
- **Input tokens**: ~400-600 tokens (route data + prompt)
- **Output tokens**: ~600-800 tokens (coaching insights)
- **Estimated cost**: $0.001 - $0.003 per analysis

### Monthly Cost Examples
- **100 analyses/month**: ~$0.10 - $0.30
- **1,000 analyses/month**: ~$1.00 - $3.00
- **10,000 analyses/month**: ~$10.00 - $30.00

### Cost Optimization
- **Caching**: 1-hour TTL reduces duplicate calls for same activity
- **Conditional**: Only calls API when user analyzes route (not on page load)
- **Efficient model**: GPT-4o-mini is 60x cheaper than GPT-4

## Response Format

### Expected HTML Structure
```html
<h3>Route Overview</h3>
<p>This is a moderately hilly 5.0-mile route with 450 feet of elevation gain...</p>

<h3>Key Features</h3>
<ul>
<li>Mostly flat start for the first 1.5 miles</li>
<li>Significant climbing from mile 2 to mile 3.5 with a 3.2% average grade</li>
<li>Recovery descent in the final mile</li>
</ul>

<h3>Pacing & Effort Strategy</h3>
<p>Start conservatively on the flat opening miles to save energy for the climbs ahead. When you hit the hills around mile 2, maintain a steady effort rather than pace...</p>
```

### Handling Variations
- AI may use `<h4>` for subsections
- AI may use `<strong>` for emphasis
- AI may add `<em>` for important notes
- All variations are allowed by DOMPurify config

## Error Handling

### Common Scenarios

**API Key Not Configured:**
```typescript
if (!client) {
  console.warn('OpenAI API key not configured. AI coaching insights will not be available.');
  return null;
}
```
- App continues without AI insights
- No error shown to user
- Feature gracefully disabled

**API Request Failed:**
```typescript
catch (error) {
  console.error('Error getting AI coaching insights:', error);
  return null;
}
```
- Error logged to console
- Returns null to caller
- Analysis displayed without AI section

**Invalid Response:**
```typescript
if (!completion.choices || completion.choices.length === 0) {
  console.error('OpenAI returned no completion choices');
  return null;
}
```
- Validates response structure
- Returns null if malformed
- App continues gracefully

### Rate Limiting
OpenAI has rate limits based on your tier:
- **Free tier**: 3 RPM, 40,000 TPM
- **Tier 1**: 500 RPM, 2M TPM
- **Tier 2+**: Higher limits

The app's 1-hour cache helps stay within limits.

## Testing

### Manual Testing

**With API Key:**
1. Set `OPENAI_API_KEY` in `.env.local`
2. Analyze a route
3. Verify AI insights appear below route summary
4. Check insights are relevant to elevation profile
5. Verify HTML is properly formatted

**Without API Key:**
1. Remove `OPENAI_API_KEY` from `.env.local`
2. Analyze a route
3. Verify no AI insights section appears
4. Verify no errors in console
5. Verify rest of analysis works normally

**Caching:**
1. Analyze a Strava activity with API key
2. Check console for "Using cached AI coaching insights"
3. Re-analyze same activity within 1 hour
4. Verify cached insights are used (no API call)

### Unit Tests
Currently no unit tests exist. Consider adding:
- Prompt building tests
- HTML sanitization tests
- Cache key generation tests
- Error handling tests

### Integration Tests
Consider adding:
- Mock OpenAI API responses
- Test with various route profiles
- Test error scenarios

## Troubleshooting

### No AI Insights Appearing

**Check API Key:**
```bash
# In .env.local
echo $OPENAI_API_KEY
```

**Check Console:**
Look for warnings:
- "OpenAI API key not configured..."
- "Error getting AI coaching insights..."

**Verify Balance:**
- Check [OpenAI Usage](https://platform.openai.com/usage)
- Ensure account has credits

### Rate Limit Errors

**Error Message:**
```
Error 429: Rate limit exceeded
```

**Solutions:**
- Wait and retry
- Upgrade OpenAI tier
- Implement longer cache TTL
- Reduce request frequency

### Poor Quality Insights

**Potential Issues:**
- Temperature too high (increase creativity, decrease accuracy)
- Prompt not clear enough
- Model not suitable for task

**Solutions:**
- Adjust temperature in `lib/openai.ts`
- Improve prompt template
- Try different model (GPT-4o, GPT-3.5-turbo)

## Customization

### Change Model
**File:** `lib/openai.ts`

```typescript
// Change from gpt-4o-mini to gpt-4o
const completion = await client.chat.completions.create({
  model: 'gpt-4o',  // More powerful but more expensive
  // ... rest of config
});
```

### Adjust Temperature
```typescript
temperature: 0.7,  // Default
// Lower (0.3-0.5): More focused and deterministic
// Higher (0.8-1.0): More creative and varied
```

### Modify Prompt
**File:** `lib/prompts/fitnessCoachPrompt.ts`

Edit `FITNESS_COACH_SYSTEM_PROMPT` or `FITNESS_COACH_USER_PROMPT_TEMPLATE` to change:
- Coaching style
- Response structure
- Focus areas
- Tone of voice

### Change Token Limit
```typescript
max_tokens: 1000,  // Default (~750 words)
// Lower: Shorter insights, lower cost
// Higher: More detailed insights, higher cost
```

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Best Practices for Prompting](https://platform.openai.com/docs/guides/prompt-engineering)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

## Related Documentation

- [Overview](../overview.md) - Application overview
- [API Routes](../api-routes/analyze.md) - Analyze endpoint documentation
- [Lib Utilities](../lib/openai.md) - OpenAI utility functions
- [Prompts](../lib/prompts.md) - Prompt engineering documentation
