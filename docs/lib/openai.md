# openai.ts

## Overview
OpenAI API integration for generating AI coaching insights.

## File Location
`lib/openai.ts`

## Functions

### `getOpenAIClient(): OpenAI | null`

**Purpose**: Get configured OpenAI client instance

**Returns**: OpenAI client or null if not configured

**Usage**:
```typescript
const client = getOpenAIClient();
if (!client) {
  console.warn('OpenAI not configured');
  return null;
}
```

### `getAICoachingInsights(analysis, activityId?): Promise<string | null>`

**Purpose**: Generate AI coaching insights for route

**Parameters**:
- `analysis`: RouteAnalysis object
- `activityId`: Optional ID for caching

**Returns**: HTML string or null

**Caching**: Uses 1-hour TTL when activityId provided

**Example**:
```typescript
const insights = await getAICoachingInsights(analysis, activityId);
if (insights) {
  // Display HTML insights
}
```

## Configuration

### Environment Variable
`OPENAI_API_KEY` - Required for functionality

### Model
`gpt-4o-mini` - Cost-effective model

### Parameters
- Temperature: 0.7
- Max tokens: 1000

## Error Handling

Returns `null` on:
- API key not configured
- API request failure
- Invalid response
- Rate limit exceeded

## Dependencies

### External
```typescript
import OpenAI from 'openai';
```

### Internal
```typescript
import { FITNESS_COACH_SYSTEM_PROMPT, buildFitnessCoachPrompt } from './prompts/fitnessCoachPrompt';
import { RouteAnalysis } from '@/types';
import { cache, getCacheKey } from './cache';
```

## Used By

- `POST /api/analyze`

## Related Documentation

- [OpenAI Integration](../third-party/openai.md)
- [Prompts](./prompts.md)
- [Cache](./cache.md)
