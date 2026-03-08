import { type Page } from "@playwright/test";

/**
 * Test credentials — these must exist in the Supabase project.
 *
 * Approach: We use the Supabase Management API (service role key) to
 * pre-create test users in `global-setup.ts`. If you prefer manual
 * setup, create these users in the Lovable Cloud backend view.
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

/**
 * Sign in via the /auth page with email + password.
 * Handles both sign-in/sign-up toggle states gracefully.
 */
export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.waitForLoadState("networkidle");

  // The Auth page defaults to "anonymous" mode — we need to switch to sign-in
  // Click the "Sign in" link at the bottom to switch modes
  const signInLink = page.getByRole("button", { name: /sign in/i }).or(
    page.locator("button").filter({ hasText: /sign in/i })
  );

  // If there's a "Sign in" toggle link at bottom, click it
  const bottomLink = page.locator("button.text-forest").filter({ hasText: /sign in/i });
  if (await bottomLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await bottomLink.click();
    await page.waitForTimeout(300);
  }

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);

  // Click the submit button (not the mode toggle)
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to app
  await page.waitForURL(/\/app/, { timeout: 15_000 });
}

/**
 * Sign in anonymously via the /auth page.
 * Requires clicking the consent checkbox first.
 */
export async function signInAnonymously(page: Page) {
  await page.goto("/auth");
  await page.waitForLoadState("networkidle");

  // Check consent checkbox
  const consentCheckbox = page.locator('button[role="checkbox"]');
  if (await consentCheckbox.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const state = await consentCheckbox.getAttribute("data-state");
    if (state !== "checked") {
      await consentCheckbox.click();
    }
  }

  // Click "Enter anonymously" button
  await page.getByRole("button", { name: /enter anonymously/i }).click();

  // Wait for redirect to onboarding or app
  await page.waitForURL(/\/(app|onboarding)/, { timeout: 15_000 });
}

/**
 * Complete the 6-step onboarding flow.
 * Steps: 0-2 welcome screens, 3 language, 4 cultural context, 5 goals.
 */
export async function completeOnboarding(page: Page, language = "English") {
  if (!page.url().includes("/onboarding")) return;

  // Steps 0-2: Welcome screens — click Continue 3 times
  for (let i = 0; i < 3; i++) {
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await continueBtn.waitFor({ state: "visible", timeout: 5_000 });
    await continueBtn.click();
    await page.waitForTimeout(400);
  }

  // Step 3: Language selection — select English (or specified language)
  const langBtn = page.getByText(language, { exact: true });
  if (await langBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await langBtn.click();
  }
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(400);

  // Step 4: Cultural context — skip (just click Continue)
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(400);

  // Step 5: Goals — select first goal and click Get Started
  const goalButtons = page.locator("button").filter({ hasText: /stress|anxiety|grief/i });
  const firstGoal = goalButtons.first();
  if (await firstGoal.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await firstGoal.click();
  }
  await page.getByRole("button", { name: /get started|saving/i }).click();

  // Wait for navigation to /app
  await page.waitForURL(/\/app/, { timeout: 15_000 });
}

/** Sign in via the /volunteer page */
export async function signInVolunteer(page: Page, email: string, password: string) {
  await page.goto("/volunteer");
  await page.waitForLoadState("networkidle");

  // Switch to sign-in mode if currently on sign-up
  const signInLink = page.locator("button.text-forest").filter({ hasText: /sign in/i });
  if (await signInLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await signInLink.click();
    await page.waitForTimeout(300);
  }

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);

  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/app/, { timeout: 15_000 });
}

/** Sign out by navigating to profile and clicking sign out */
export async function signOut(page: Page) {
  await page.goto("/app/profile");
  await page.waitForLoadState("networkidle");

  const signOutBtn = page.getByRole("button", { name: /sign out/i });
  await signOutBtn.waitFor({ state: "visible", timeout: 5_000 });
  await signOutBtn.click();
  await page.waitForURL(/\/(auth)?$/, { timeout: 10_000 });
}
