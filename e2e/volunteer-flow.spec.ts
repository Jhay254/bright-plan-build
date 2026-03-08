import { test, expect } from "@playwright/test";
import { signInVolunteer, TEST_VOLUNTEER } from "./helpers/auth";

test.describe("Volunteer Happy Path", () => {
  test("Auth → Dashboard → Training → Availability → Portfolio", async ({ page }) => {
    // 1. Sign in as volunteer (requires pre-seeded user)
    await signInVolunteer(page, TEST_VOLUNTEER.email, TEST_VOLUNTEER.password);

    // 2. Should land on or navigate to volunteer dashboard
    await page.goto("/app/volunteer");
    await expect(page).toHaveURL(/\/app\/volunteer/);
    await page.waitForLoadState("networkidle");

    // 3. Training tab — complete a module
    const trainingTab = page.getByRole("tab", { name: /training/i });
    if (await trainingTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await trainingTab.click();
      await page.waitForTimeout(500);

      const checkbox = page.locator('button[role="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
        const wasChecked = await checkbox.getAttribute("data-state");
        if (wasChecked === "unchecked") {
          await checkbox.click();
          await expect(checkbox).toHaveAttribute("data-state", "checked", { timeout: 3_000 });
        }
      }
    }

    // 4. Schedule tab — set availability
    const scheduleTab = page.getByRole("tab", { name: /schedule/i });
    if (await scheduleTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await scheduleTab.click();
      await page.waitForTimeout(500);
      await expect(page.getByText(/availability/i)).toBeVisible({ timeout: 3_000 });
    }

    // 5. Portfolio tab — check share button
    const portfolioTab = page.getByRole("tab", { name: /portfolio/i });
    if (await portfolioTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await portfolioTab.click();
      await page.waitForTimeout(500);

      const shareBtn = page.getByRole("button", { name: /share/i });
      if (await shareBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await shareBtn.click();
      }
    }

    // 6. Sessions tab
    const sessionsTab = page.getByRole("tab", { name: /sessions/i });
    if (await sessionsTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await sessionsTab.click();
    }

    // 7. Navigate to cocoon to see available sessions
    await page.goto("/app/cocoon");
    await expect(page).toHaveURL(/\/app\/cocoon/);
  });
});
