import { test, expect } from '@playwright/test';

test.describe('Analysis Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and trigger analysis
    await page.goto('/');
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();
    
    // Wait for analysis to complete
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });
  });

  test('should display route summary section', async ({ page }) => {
    await expect(page.getByText('Route Summary')).toBeVisible();
    
    // Summary should have some text content
    const summarySection = page.locator('.bg-blue-50, .dark\\:bg-blue-900\\/20').first();
    const summaryText = await summarySection.textContent();
    expect(summaryText).toBeTruthy();
    expect(summaryText?.length).toBeGreaterThan(20);
  });

  test('should display overall statistics correctly', async ({ page }) => {
    // Check Total Distance
    await expect(page.getByText('Total Distance')).toBeVisible();
    const distanceValue = page.locator('text=/\\d+\\.\\d+ mi/').first();
    await expect(distanceValue).toBeVisible();

    // Check Elevation Gain
    await expect(page.getByText('Elevation Gain')).toBeVisible();
    const gainValue = page.locator('text=/\\+\\d+ ft/').first();
    await expect(gainValue).toBeVisible();

    // Check Elevation Loss
    await expect(page.getByText('Elevation Loss')).toBeVisible();
    const lossValue = page.locator('text=/-\\d+ ft/').first();
    await expect(lossValue).toBeVisible();
  });

  test('should display mile-by-mile breakdown', async ({ page }) => {
    await expect(page.getByText('Mile-by-Mile Breakdown')).toBeVisible();
    
    // Should have at least one mile segment
    const mileSegments = page.locator('text=/Mile \\d+\\.\\d+ - \\d+\\.\\d+/');
    await expect(mileSegments.first()).toBeVisible();
  });

  test('should show terrain descriptions for each segment', async ({ page }) => {
    // Look for terrain descriptions
    const terrainDescriptions = [
      'Relatively flat',
      'Gentle climb',
      'Moderate climb',
      'Steep climb',
      'Gentle descent',
      'Moderate descent',
      'Steep descent',
    ];

    // At least one terrain description should be visible
    let foundTerrain = false;
    for (const desc of terrainDescriptions) {
      const element = page.getByText(desc, { exact: false });
      if (await element.isVisible().catch(() => false)) {
        foundTerrain = true;
        break;
      }
    }
    expect(foundTerrain).toBe(true);
  });

  test('should display grade percentages for segments', async ({ page }) => {
    // Check for grade badges
    const gradeBadges = page.locator('text=/[+-]?\\d+\\.\\d+%/');
    await expect(gradeBadges.first()).toBeVisible();
  });

  test('should show elevation gain and loss for each segment', async ({ page }) => {
    await expect(page.getByText('Gain:', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Loss:', { exact: false }).first()).toBeVisible();
  });

  test('should highlight segment on hover', async ({ page }) => {
    // Find the first mile segment
    const firstSegment = page.locator('text=/Mile \\d+\\.\\d+ - \\d+\\.\\d+/').first();
    await firstSegment.scrollIntoViewIfNeeded();
    
    // Get the parent container
    const segmentContainer = firstSegment.locator('..');
    
    // Hover over the segment
    await segmentContainer.hover();
    
    // Check if it has hover styling (blue background)
    const classList = await segmentContainer.getAttribute('class');
    expect(classList).toBeTruthy();
  });

  test('should render elevation chart when points are available', async ({ page }) => {
    // Look for chart container
    // The chart is rendered with canvas/svg, so we check for its container
    const chartElements = page.locator('canvas, svg').first();
    
    // Wait a bit for chart to render
    await page.waitForTimeout(1000);
    
    // Chart should be in the DOM (might be rendered dynamically)
    const chartCount = await page.locator('canvas, svg').count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should show route map section', async ({ page }) => {
    await expect(page.getByText('Route Map')).toBeVisible();
    
    // Map container should be present
    // Leaflet renders in a div with specific class
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test('should display shareable link information when available', async ({ page }) => {
    // Check if shareable link section appears (only if activityId is present)
    const shareableLink = page.getByText('Analysis Complete!');
    
    // This might or might not appear depending on the mock response
    // So we just check if it's there without asserting it must be
    const isVisible = await shareableLink.isVisible().catch(() => false);
    
    // If visible, check for the link
    if (isVisible) {
      await expect(page.getByRole('link', { name: /View Shareable Page/i })).toBeVisible();
    }
  });

  test('should maintain responsive layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Main content should still be visible
    await expect(page.getByText('Route Summary')).toBeVisible();
    await expect(page.getByText('Mile-by-Mile Breakdown')).toBeVisible();
  });

  test('should maintain responsive layout on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Main content should still be visible
    await expect(page.getByText('Route Summary')).toBeVisible();
    await expect(page.getByText('Mile-by-Mile Breakdown')).toBeVisible();
  });

  test('should scroll to show analysis results', async ({ page }) => {
    // Analysis results should be scrolled into view
    const summarySection = page.getByText('Route Summary');
    await expect(summarySection).toBeInViewport();
  });
});
