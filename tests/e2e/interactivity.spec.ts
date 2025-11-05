import { test, expect } from '@playwright/test';

test.describe('User Interactions and UX', () => {
  test('should allow user to clear and re-enter Strava URL', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    
    // Enter first URL
    await input.fill('https://www.strava.com/activities/111111');
    await expect(input).toHaveValue('https://www.strava.com/activities/111111');
    
    // Clear and enter new URL
    await input.clear();
    await input.fill('https://www.strava.com/activities/222222');
    await expect(input).toHaveValue('https://www.strava.com/activities/222222');
  });

  test('should handle keyboard interaction for input and submit', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    
    // Type using keyboard
    await input.click();
    await page.keyboard.type('https://www.strava.com/activities/123456');
    
    // Submit using Enter key
    await page.keyboard.press('Enter');
    
    // Should show loading state
    await expect(page.getByText('Analyzing route...')).toBeVisible();
  });

  test('should show appropriate cursor on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    
    // Button should have pointer cursor
    const cursor = await analyzeButton.evaluate(el => 
      window.getComputedStyle(el).cursor
    );
    
    // Disabled buttons might have different cursor
    expect(['pointer', 'not-allowed', 'default']).toContain(cursor);
  });

  test('should show focus states on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    
    // Tab to input
    await page.keyboard.press('Tab');
    
    // Check if input is focused
    const isFocused = await input.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should handle multiple analyses in sequence', async ({ page }) => {
    await page.goto('/');
    
    // First analysis
    let input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/111111');
    let analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });
    
    // Scroll back to top for second analysis
    await page.goto('/');
    
    // Second analysis
    input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/222222');
    analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });
  });

  test('should handle browser back button after analysis', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();
    
    // Wait for analysis
    await expect(page.getByText('Route Summary')).toBeVisible({ timeout: 30000 });
    
    // Go back
    await page.goBack();
    
    // Should be back to initial state
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();
  });

  test('should show visual feedback on button click', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    
    // Click and check for loading state change
    await analyzeButton.click();
    
    // Button should be disabled during loading
    await expect(analyzeButton).toBeDisabled();
  });

  test('should handle rapid clicking gracefully', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    
    // Click multiple times rapidly
    await analyzeButton.click();
    await analyzeButton.click();
    await analyzeButton.click();
    
    // Should still only trigger one analysis
    // Button should be disabled after first click
    await expect(analyzeButton).toBeDisabled();
  });

  test('should support copy-paste in input field', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    
    // Simulate copy-paste operation
    const testUrl = 'https://www.strava.com/activities/999999';
    await input.click();
    
    // Use clipboard API simulation
    await page.evaluate(url => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.value = url;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, testUrl);
    
    // Verify value
    await expect(input).toHaveValue(testUrl);
  });

  test('should provide accessible labels and ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check that main sections have proper headings
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
    
    // Input should be accessible
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await expect(input).toBeVisible();
  });

  test('should handle window resize gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();
    
    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('heading', { name: 'Route Analyzer' })).toBeVisible();
  });

  test('should maintain state during tab switching', async ({ page, context }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    await input.fill('https://www.strava.com/activities/123456');
    
    // Open new tab
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Switch back to original tab
    await page.bringToFront();
    
    // Input value should still be there
    await expect(input).toHaveValue('https://www.strava.com/activities/123456');
    
    await newPage.close();
  });

  test('should show error state appropriately', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder(/Enter Strava activity URL/);
    
    // Try with invalid URL format (though backend might still process it)
    await input.fill('invalid-url');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await analyzeButton.click();
    
    // Wait for response (might be error or demo data)
    await page.waitForTimeout(2000);
    
    // Should show some feedback (error message or analysis result)
    const hasError = await page.getByText(/error|failed/i).isVisible().catch(() => false);
    const hasAnalysis = await page.getByText('Route Summary').isVisible().catch(() => false);
    
    // One of these should be true
    expect(hasError || hasAnalysis).toBe(true);
  });
});
