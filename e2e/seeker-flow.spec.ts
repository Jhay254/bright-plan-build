import { test, expect } from "@playwright/test";
import { signInAnonymously } from "./helpers/auth";

test.describe("Seeker Happy Path", () => {
  test("Landing → Auth → Onboarding → Home → Session → Journal → Profile → Sign Out", async ({ page }) => {
    // 1. Landing page loads
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    // 2. Anonymous sign-in
    await signInAnonymously(page);

    // 3. Onboarding flow
    const url = page.url();
    if (url.includes("/onboarding")) {
      // Select language (English)
      await page.getByText("English").click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Cultural context (skip)
      await page.getByRole("button", { name: /continue/i }).click();

      // Select at least one healing goal
      const goalButtons = page.locator('[data-testid="goal-button"]');
      if (await goalButtons.count() > 0) {
        await goalButtons.first().click();
      }
      await page.getByRole("button", { name: /get started|continue/i }).click();

      await page.waitForURL(/\/app/, { timeout: 10_000 });
    }

    // 4. Home page
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // 5. Navigate to Cocoon and request a session
    await page.goto("/app/cocoon");
    const newSessionBtn = page.getByRole("button", { name: /new session|start/i });
    if (await newSessionBtn.isVisible()) {
      await newSessionBtn.click();
      await page.waitForURL(/\/app\/cocoon\/new/);

      // Select topic
      const topicOption = page.locator("button").filter({ hasText: /anxiety|stress|relationship/i }).first();
      if (await topicOption.isVisible()) {
        await topicOption.click();
      }

      // Submit
      const requestBtn = page.getByRole("button", { name: /request|submit/i });
      if (await requestBtn.isEnabled()) {
        await requestBtn.click();
        await page.waitForURL(/\/app\/cocoon\//);
      }
    }

    // 6. Journal — create new entry
    await page.goto("/app/journal");
    await expect(page).toHaveURL(/\/app\/journal/);

    const newEntryBtn = page.getByRole("button", { name: /new|write/i });
    if (await newEntryBtn.isVisible()) {
      await newEntryBtn.click();
      await page.waitForURL(/\/app\/journal\/new/);

      // Type in editor
      const textarea = page.locator("textarea").first();
      await textarea.fill("Today I feel hopeful about the future.");

      // Save
      const saveBtn = page.getByRole("button", { name: /save/i });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
      }
    }

    // 7. Profile page
    await page.goto("/app/profile");
    await expect(page).toHaveURL(/\/app\/profile/);

    // Verify export buttons exist
    await expect(page.getByText(/export/i).first()).toBeVisible();

    // 8. Sign out
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await signOutBtn.click();
    await page.waitForURL(/\/(auth)?$/, { timeout: 10_000 });
  });
});
