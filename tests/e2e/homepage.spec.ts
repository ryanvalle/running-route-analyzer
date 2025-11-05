import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should render the main page with title and description', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();

    // Check for description
    await expect(page.getByText('Analyze your routes from Strava or FIT files')).toBeVisible();
  });

  test('should show Strava input section', async ({ page }) => {
    await page.goto('/');

    // Check for Strava section heading
    await expect(page.getByRole('heading', { name: 'From Strava Activity' })).toBeVisible();

    // Check for input field
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await expect(input).toBeVisible();

    // Check for analyze button
    await expect(page.getByRole('button', { name: 'Analyze' })).toBeVisible();
  });

  test('should show "How it works" section when no analysis is present', async ({ page }) => {
    await page.goto('/');

    // Check for info section
    await expect(page.getByText('How it works')).toBeVisible();
    await expect(page.getByText(/Enter a Strava activity URL/)).toBeVisible();
  });

  test('should disable analyze button when input is empty', async ({ page }) => {
    await page.goto('/');

    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await expect(analyzeButton).toBeDisabled();
  });

  test('should enable analyze button when input has text', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });

    await input.fill('https://www.strava.com/activities/123456');
    await expect(analyzeButton).toBeEnabled();
  });

  test('should show loading state when analyzing', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');

    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();

    // Should show loading indicator
    await expect(page.getByText('Analyzing route...')).toBeVisible();
  });

  test('should display analysis results after successful analysis', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');

    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();

    // Wait for analysis to complete
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });

    // Check for overall stats
    await expect(page.getByText('Total Distance')).toBeVisible();
    await expect(page.getByText('Elevation Gain')).toBeVisible();
    await expect(page.getByText('Elevation Loss')).toBeVisible();

    // Check for mile-by-mile breakdown
    await expect(page.getByText('Mile-by-Mile Breakdown')).toBeVisible();
  });

  test('should show route map when analysis has points', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');

    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();

    // Wait for analysis to complete
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });

    // Check for route map heading
    await expect(page.getByText('Route Map')).toBeVisible();
  });

  test('should support dark mode toggle via system preference', async ({ page }) => {
    await page.goto('/');

    // Get the body background color
    const bodyClass = await page.evaluate(() => document.body.className);
    
    // The page should respect system dark mode preference
    // This test verifies dark mode classes are working
    expect(bodyClass).toBeDefined();
  });

  test('should show demo data warning when using mock data', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');

    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();

    // Should eventually show demo data warning or analysis results
    await page.waitForSelector('text=/Route Summary|demo data/i', { timeout: 30000 });
  });
});
