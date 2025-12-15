import { test, expect } from '@playwright/test';

/**
 * Upload Tests
 * Tests model ingestion functionality (UPLOAD functionality)
 */

test.describe('Upload - Model Ingestion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
    // Wait for page to be ready - check if we got redirected to auth
    await page.waitForLoadState('networkidle');
  });
});
