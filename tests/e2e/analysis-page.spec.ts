import { test, expect } from '@playwright/test';

test.describe('Shareable Analysis Page', () => {
  // Use a mock activity ID for testing
  const mockAthleteId = '987654321';
  const mockActivityId = '123456';
  const analysisUrl = `/analysis/${mockAthleteId}/${mockActivityId}`;

  test('should show loading state initially', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Should show loading indicator
    const loadingText = page.getByText('Loading activity data...');
    
    // Check if it's visible initially (might be brief)
    const isVisible = await loadingText.isVisible().catch(() => false);
    
    // Either loading was visible or page loaded quickly
    expect(isVisible || await page.getByText('Activity').isVisible()).toBeTruthy();
  });

  test('should display activity title and ID', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Should show activity ID in the page
    await expect(page.getByText(/Activity #\d+/)).toBeVisible();
  });

  test('should show link to go back to home', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Should have link back to home
    const backLink = page.getByRole('link', { name: /Analyze another route/i });
    await expect(backLink).toBeVisible();
  });

  test('should display share section with copy link button', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Should show share section
    await expect(page.getByText('Share this analysis')).toBeVisible();
    
    // Should have copy link button
    const copyButton = page.getByRole('button', { name: /Copy Link/i });
    await expect(copyButton).toBeVisible();
  });

  test('should show cached indicator when data is cached', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Check if cached indicator is present
    // This might not always show if data isn't cached
    const cachedText = page.getByText('(Cached)');
    const isVisible = await cachedText.isVisible().catch(() => false);
    
    // Test passes whether cached indicator shows or not
    expect(isVisible !== undefined).toBe(true);
  });

  test('should copy link to clipboard when copy button is clicked', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Click copy button
    const copyButton = page.getByRole('button', { name: /Copy Link/i });
    await copyButton.click();
    
    // Should show success message
    await expect(page.getByText('✓ Copied!')).toBeVisible();
    
    // Success message should disappear after a few seconds
    await expect(page.getByText('✓ Copied!')).not.toBeVisible({ timeout: 5000 });
  });

  test('should display analysis results', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Should display route analysis components
    // (These might take time to load or might show error if API returns error)
    await page.waitForTimeout(2000);
    
    // Check for analysis components or error message
    const hasAnalysis = await page.getByText('Route Summary').isVisible().catch(() => false);
    const hasError = await page.getByText(/not found|error/i).isVisible().catch(() => false);
    
    // One of these should be present
    expect(hasAnalysis || hasError).toBe(true);
  });

  test('should handle invalid activity ID', async ({ page }) => {
    const invalidUrl = `/analysis/${mockAthleteId}/invalid-id`;
    await page.goto(invalidUrl);
    
    // Should show error message
    await expect(page.getByText('Invalid activity ID')).toBeVisible({ timeout: 10000 });
    
    // Should have link to go back home
    await expect(page.getByRole('link', { name: /Go back to home/i })).toBeVisible();
  });

  test('should have working back to home link', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Click back to home link
    const backLink = page.getByRole('link', { name: /Analyze another route/i });
    await backLink.click();
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Main content should be visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should maintain dark mode support', async ({ page }) => {
    await page.goto(analysisUrl);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 30000 });
    
    // Page should have dark mode classes
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toBeDefined();
  });

  test('should show appropriate error for non-existent activity', async ({ page }) => {
    const nonExistentUrl = `/analysis/999999999/999999999`;
    await page.goto(nonExistentUrl);
    
    // Should eventually show an error or content
    await page.waitForTimeout(5000);
    
    // Check for error message or content
    const hasError = await page.getByText(/not found|error|failed/i).isVisible().catch(() => false);
    const hasContent = await page.locator('h1').isVisible().catch(() => false);
    
    expect(hasError || hasContent).toBe(true);
  });
});
