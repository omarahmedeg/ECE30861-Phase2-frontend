import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page, context }) => {
  // Instead of real login, we'll mock the authentication state
  // This avoids dependency on the backend being available

  // Go to auth page first (to set the origin)
  await page.goto("/auth");

  // Set authentication state in localStorage
  await page.evaluate(() => {
    // Set a mock auth token
    localStorage.setItem("auth_token", "mock-test-token-for-playwright");
    localStorage.setItem("username", "ece30861defaultadminuser");
    localStorage.setItem("isAdmin", "true");
  });

  // Save the storage state with the mock auth
  await context.storageState({ path: authFile });

  console.log("✓ Mock auth state created and saved");
});
