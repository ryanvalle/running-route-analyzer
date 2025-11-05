# Test Suite Documentation

This directory contains comprehensive test coverage for the Running Route Analyzer application, including unit tests and end-to-end (E2E) browser tests.

## Test Structure

```
tests/
├── e2e/                      # Playwright end-to-end tests
│   ├── homepage.spec.ts      # Homepage rendering and interaction tests
│   ├── analysis-display.spec.ts  # Analysis results display tests
│   ├── analysis-page.spec.ts # Shareable analysis page tests
│   └── interactivity.spec.ts # User interaction and UX tests
├── unit/                     # Vitest unit tests
│   ├── cache.test.ts         # Cache functionality tests
│   ├── routeAnalysis.test.ts # Route analysis logic tests
│   ├── openai.test.ts        # OpenAI integration tests
│   └── api-routes.test.ts    # API route handler tests
├── fixtures/                 # Test data and mocks
│   └── mockRouteData.ts      # Mock route points and analysis data
└── setup.ts                  # Test environment setup
```

## Running Tests

### Unit Tests (Vitest)

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests with UI:
```bash
npm run test:ui
```

### End-to-End Tests (Playwright)

Run E2E tests:
```bash
npm run test:e2e
```

Run E2E tests in UI mode:
```bash
npm run test:e2e:ui
```

Run specific test file:
```bash
npx playwright test tests/e2e/homepage.spec.ts
```

### Run All Tests

```bash
npm run test:all
```

## Test Coverage

### Unit Tests (63 tests)

#### Cache Module (`lib/cache.ts`) - 20 tests
- ✅ Set and get operations
- ✅ TTL (Time To Live) expiration
- ✅ Has key checking
- ✅ Delete operations
- ✅ Clear all entries
- ✅ Cache key generators
- ✅ Data type handling
- ✅ Cache isolation

#### Route Analysis Module (`lib/routeAnalysis.ts`) - 20 tests
- ✅ Route analysis with multiple segments
- ✅ Distance calculations
- ✅ Elevation gain/loss calculations
- ✅ Mile-based segmentation
- ✅ Terrain description assignment
- ✅ Grade percentage calculations
- ✅ Summary generation
- ✅ Edge cases (empty routes, single points, flat terrain)
- ✅ Unit conversion functions

#### OpenAI Module (`lib/openai.ts`) - 10 tests
- ✅ Client initialization
- ✅ API key validation
- ✅ Coaching insights generation
- ✅ Caching with activity ID
- ✅ Error handling
- ✅ Response validation
- ✅ Cache key compatibility (string/number)

#### API Routes (`app/api/analyze/route.ts`) - 13 tests
- ✅ Input validation (required fields)
- ✅ Point structure validation
- ✅ Successful analysis
- ✅ Activity ID handling
- ✅ Error handling
- ✅ Large dataset performance
- ✅ Malformed JSON handling
- ✅ Type validation

### End-to-End Tests (Playwright)

#### Homepage Tests (`homepage.spec.ts`) - 9 tests
- ✅ Page rendering with title and description
- ✅ Strava input section display
- ✅ Info section when no analysis
- ✅ Button enable/disable states
- ✅ Loading state during analysis
- ✅ Analysis results display
- ✅ Route map rendering
- ✅ Dark mode support
- ✅ Demo data warning

#### Analysis Display Tests (`analysis-display.spec.ts`) - 11 tests
- ✅ Route summary section
- ✅ Overall statistics display
- ✅ Mile-by-mile breakdown
- ✅ Terrain descriptions
- ✅ Grade percentages
- ✅ Elevation gain/loss per segment
- ✅ Segment hover highlighting
- ✅ Elevation chart rendering
- ✅ Route map section
- ✅ Responsive layout (mobile/tablet)
- ✅ Viewport scrolling

#### Interactivity Tests (`interactivity.spec.ts`) - 15 tests
- ✅ URL input clearing and re-entering
- ✅ Keyboard interactions
- ✅ Cursor states on interactive elements
- ✅ Focus states
- ✅ Sequential analyses
- ✅ Browser back button handling
- ✅ Visual feedback on clicks
- ✅ Rapid clicking protection
- ✅ Copy-paste support
- ✅ Accessibility (ARIA attributes)
- ✅ Window resize handling
- ✅ Tab switching state persistence
- ✅ Error state display

#### Analysis Page Tests (`analysis-page.spec.ts`) - 12 tests
- ✅ Loading state
- ✅ Activity title and ID display
- ✅ Back to home link
- ✅ Share section with copy button
- ✅ Cached indicator
- ✅ Clipboard copy functionality
- ✅ Analysis results display
- ✅ Invalid activity ID handling
- ✅ Navigation functionality
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Non-existent activity error handling

## Mock Data

Test fixtures are located in `tests/fixtures/mockRouteData.ts` and include:

- **mockRoutePoints**: A 5-mile route with varied terrain (flat, climbs, descents)
- **mockSegments**: Expected segment breakdown for the mock route
- **mockAnalysis**: Complete analysis object with all fields
- **emptyRoutePoints**: Edge case with no points
- **singlePointRoute**: Edge case with single point
- **mockStravaActivity**: Strava activity metadata
- **mockAICoachingInsights**: Sample AI coaching response

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- Environment: jsdom (for DOM testing)
- Setup file: `tests/setup.ts`
- Coverage provider: v8
- Test pattern: `tests/unit/**/*.{test,spec}.{ts,tsx}`

### Playwright Configuration (`playwright.config.ts`)
- Browser: Chromium
- Base URL: http://localhost:3000
- Web server: Automatically starts dev server
- Retries: 2 on CI, 0 locally
- Trace: On first retry

## Key Testing Features

### Caching Tests
- Validates 1-hour TTL for cached data
- Tests cache invalidation
- Verifies activity-specific caching
- Tests AI insights caching

### Data Parsing Tests
- Route point validation
- Elevation calculations
- Distance conversions (meters to miles/feet)
- Segment generation
- Terrain classification

### Rendering Tests
- Static page rendering (initial load)
- Dynamic analysis results rendering
- Chart and map component rendering
- Responsive design across viewports
- Dark mode styling

### Interactivity Tests
- Form input handling
- Button states and interactions
- Loading states
- Error handling
- Navigation flows
- Clipboard operations

## Best Practices

1. **Unit Tests**: Focus on individual functions and modules in isolation
2. **E2E Tests**: Test complete user workflows and interactions
3. **Mock Data**: Use consistent, realistic test data from fixtures
4. **Async Operations**: Properly handle promises and async operations
5. **Error Cases**: Test both success and failure scenarios
6. **Edge Cases**: Include tests for empty data, invalid input, etc.
7. **Isolation**: Each test should be independent and not rely on others

## Continuous Integration

Tests are designed to run in CI environments:
- Unit tests run quickly (< 5 seconds)
- E2E tests auto-start the dev server
- Retries are enabled for flaky tests
- Coverage reports are generated

## Troubleshooting

### Unit Tests Failing
- Check if dependencies are installed: `npm ci`
- Clear cache: `npm test -- --clearCache`
- Run specific test: `npm test -- tests/unit/cache.test.ts`

### E2E Tests Failing
- Ensure Playwright browsers are installed: `npx playwright install`
- Check if port 3000 is available
- Run in UI mode to debug: `npm run test:e2e:ui`
- Check network requests in browser dev tools

### Performance Issues
- Large dataset tests have 5-second timeout
- Reduce test parallelization if needed
- Check system resources

## Contributing

When adding new features:
1. Add corresponding unit tests for business logic
2. Add E2E tests for user-facing features
3. Update mock data if needed
4. Ensure all tests pass before committing
5. Maintain test coverage above 80%
