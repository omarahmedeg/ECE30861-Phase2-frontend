import { test, expect } from "@playwright/test";

/**
 * Authentication Tests
 * Tests login, signup, and session management
 */

test.describe("Authentication", () => {
  // Use non-authenticated state for auth tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("should display login form", async ({ page }) => {
    // Check that we're on the auth page
    await expect(page.locator("h1")).toContainText("Package Registry");

    // Check for login tab
    await expect(page.getByRole("tab", { name: /login/i })).toBeVisible();

    // Check for form fields
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should switch between login and signup tabs", async ({ page }) => {
    // Click signup tab
    await page.getByRole("tab", { name: /sign up/i }).click();

    // Should show confirm password field
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();

    // Switch back to login
    await page.getByRole("tab", { name: /login/i }).click();

    // Confirm password should not be visible
    await expect(page.getByLabel(/confirm password/i)).not.toBeVisible();
  });
});
