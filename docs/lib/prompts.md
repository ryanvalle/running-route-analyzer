# prompts/fitnessCoachPrompt.ts

## Overview
AI prompt templates for fitness coaching insights.

## File Location
`lib/prompts/fitnessCoachPrompt.ts`

## System Prompt

### `FITNESS_COACH_SYSTEM_PROMPT`

**Purpose**: Defines AI role and response format

**Key Instructions**:
- Act as experienced running coach
- Analyze elevation and provide actionable advice
- Use conversational, supportive tone
- Format as semantic HTML

## User Prompt Template

### `FITNESS_COACH_USER_PROMPT_TEMPLATE`

**Structure**:
1. Route statistics (distance, elevation)
2. Mile-by-mile breakdown
3. Expected response sections

**Sections**:
- Route Overview
- Key Features
- Pacing & Effort Strategy

## Builder Function

### `buildFitnessCoachPrompt(routeData): string`

**Purpose**: Build user prompt from route data

**Parameters**:
- `routeData`: Object with totals and segments

**Returns**: Formatted prompt string

**Example**:
```typescript
const prompt = buildFitnessCoachPrompt({
  totalDistance: 5.23,
  totalElevationGain: 450,
  totalElevationLoss: 420,
  segments: [...]
});
```

## Used By

- `lib/openai.ts`

## Related Documentation

- [OpenAI Integration](../third-party/openai.md)
- [OpenAI Utility](./openai.md)
