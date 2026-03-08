import { type Page } from "@playwright/test";

/**
 * Test credentials — create these users in your Supabase project
 * or use the seeder script below.
 *
 * For CI, set env vars: TEST_SEEKER_EMAIL, TEST_SEEKER_PASSWORD, etc.
 */
export const TEST_SEEKER = {
  email: process.env.TEST_SEEKER_EMAIL || "test-seeker@echo-test.local",
  password: process.env.TEST_SEEKER_PASSWORD || "TestSeeker123!",
};

export const TEST_VOLUNTEER = {
  email: process.env.TEST_VOLUNTEER_EMAIL || "test-volunteer@echo-test.local",
  password: process.env.TEST_VOLUNTEER_PASSWORD || "TestVolunteer123!",
};

export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || "test-admin@echo-test.local",
  password: process.env.TEST_ADMIN_PASSWORD || "TestAdmin123!",
};

/** Sign in via the /auth page with email + password */
export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  // Switch to sign-in mode if needed
  const signInToggle = page.getByText("Sign in");
  if (await signInToggle.isVisible()) {
    await signInToggle.click();
  }
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for redirect to app
  await page.waitForURL(/\/app/, { timeout: 10_000 });
}

/** Sign in anonymously via the /auth page */
export async function signInAnonymously(page: Page) {
  await page.goto("/auth");
  // Check consent
  const consentCheckbox = page.locator('button[role="checkbox"]');
  if (await consentCheckbox.isVisible()) {
    await consentCheckbox.click();
  }
  await page.getByRole("button", { name: /enter anonymously/i }).click();
  await page.waitForURL(/\/(app|onboarding)/, { timeout: 10_000 });
}

/** Sign in via the /volunteer page */
export async function signInVolunteer(page: Page, email: string, password: string) {
  await page.goto("/volunteer");
  const signInToggle = page.getByText("Sign in");
  if (await signInToggle.isVisible()) {
    await signInToggle.click();
  }
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/app/, { timeout: 10_000 });
}

/** Sign out by navigating to profile and clicking sign out */
export async function signOut(page: Page) {
  await page.goto("/app/profile");
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL(/\/(auth)?$/, { timeout: 10_000 });
}
