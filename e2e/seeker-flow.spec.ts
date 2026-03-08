import { test, expect } from "@playwright/test";
import { signInAnonymously, completeOnboarding } from "./helpers/auth";

test.describe("Seeker Happy Path", () => {
  test("Landing → Auth → Onboarding → Home → Cocoon → Journal → Profile → Sign Out", async ({ page }) => {
    // 1. Landing page loads
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });

    // 2. Anonymous sign-in
    await signInAnonymously(page);

    // 3. Onboarding flow (6 steps)
    await completeOnboarding(page);

    // 4. Home page — verify welcome message
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator("h1")).toBeVisible({ timeout: 5_000 });

    // 5. Navigate to Cocoon
    await page.goto("/app/cocoon");
    await expect(page).toHaveURL(/\/app\/cocoon/);

    // Try requesting a session
    const newSessionBtn = page.getByRole("button", { name: /new session|request/i });
    if (await newSessionBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newSessionBtn.click();
      await page.waitForURL(/\/app\/cocoon\/new/, { timeout: 5_000 });

      // Select a topic
      const topicBtn = page.locator('[role="radio"]').first();
      if (await topicBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await topicBtn.click();
      }

      // Submit
      const requestBtn = page.getByRole("button", { name: /request session/i });
      if (await requestBtn.isEnabled({ timeout: 2_000 }).catch(() => false)) {
        await requestBtn.click();
        // Wait for redirect to session page
        await page.waitForURL(/\/app\/cocoon\/[a-z0-9-]+$/, { timeout: 10_000 }).catch(() => {});
      }
    }

    // 6. Journal — navigate and check
    await page.goto("/app/journal");
    await expect(page).toHaveURL(/\/app\/journal/);
    await expect(page.locator("h1")).toBeVisible({ timeout: 5_000 });

    // Try creating a journal entry
    const newEntryBtn = page.getByRole("button", { name: /new entry/i });
    if (await newEntryBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newEntryBtn.click();
      await page.waitForURL(/\/app\/journal\/new/, { timeout: 5_000 });

      const textarea = page.locator("textarea").first();
      if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await textarea.fill("Today I feel hopeful about the future.");
      }

      const saveBtn = page.getByRole("button", { name: /save/i });
      if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await saveBtn.click();
      }
    }

    // 7. Profile page
    await page.goto("/app/profile");
    await expect(page).toHaveURL(/\/app\/profile/);
    await expect(page.locator("h1")).toBeVisible({ timeout: 5_000 });

    // Verify export section exists
    await expect(page.getByText(/export/i).first()).toBeVisible({ timeout: 3_000 });

    // 8. Sign out
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await signOutBtn.click();
    await page.waitForURL(/\/(auth)?$/, { timeout: 10_000 });
  });
});
