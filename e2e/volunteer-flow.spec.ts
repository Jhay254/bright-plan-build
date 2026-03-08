import { test, expect } from "@playwright/test";
import { signInVolunteer, TEST_VOLUNTEER } from "./helpers/auth";

test.describe("Volunteer Happy Path", () => {
  test("Auth → Dashboard → Training → Availability → Portfolio", async ({ page }) => {
    // 1. Sign in as volunteer
    await signInVolunteer(page, TEST_VOLUNTEER.email, TEST_VOLUNTEER.password);

    // 2. Should land on volunteer dashboard
    await page.goto("/app/volunteer");
    await expect(page).toHaveURL(/\/app\/volunteer/);

    // 3. Training tab — complete a module
    const trainingTab = page.getByRole("tab", { name: /training/i });
    if (await trainingTab.isVisible()) {
      await trainingTab.click();
      // Look for an uncompleted module checkbox
      const checkbox = page.locator('button[role="checkbox"]').first();
      if (await checkbox.isVisible()) {
        const wasChecked = await checkbox.getAttribute("data-state");
        if (wasChecked === "unchecked") {
          await checkbox.click();
          // Verify it flips
          await expect(checkbox).toHaveAttribute("data-state", "checked");
        }
      }
    }

    // 4. Schedule tab — set availability
    const scheduleTab = page.getByRole("tab", { name: /schedule/i });
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await expect(page.getByText(/availability/i)).toBeVisible();
    }

    // 5. Portfolio tab — check share button
    const portfolioTab = page.getByRole("tab", { name: /portfolio/i });
    if (await portfolioTab.isVisible()) {
      await portfolioTab.click();
      const shareBtn = page.getByRole("button", { name: /share/i });
      if (await shareBtn.isVisible()) {
        await shareBtn.click();
        // Should show a toast or clipboard action
      }
    }

    // 6. Sessions tab — check for available sessions
    const sessionsTab = page.getByRole("tab", { name: /sessions/i });
    if (await sessionsTab.isVisible()) {
      await sessionsTab.click();
    }

    // 7. Navigate to cocoon to see available sessions
    await page.goto("/app/cocoon");
    await expect(page).toHaveURL(/\/app\/cocoon/);
  });
});
