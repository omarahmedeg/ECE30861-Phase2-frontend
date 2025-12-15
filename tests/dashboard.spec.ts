import { test, expect } from '@playwright/test';

/**
 * Dashboard Tests
 * Tests package listing, search, and navigation (QUERY functionality)
 */

test.describe('Dashboard - Package Query', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });
});
