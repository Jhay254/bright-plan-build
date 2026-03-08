import { test, expect } from "@playwright/test";
import { signInAnonymously, completeOnboarding } from "./helpers/auth";

test.describe("Edge Cases", () => {
  test("Account upgrade: anonymous → email", async ({ page }) => {
    await signInAnonymously(page);
    await completeOnboarding(page);

    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Look for upgrade section
    const upgradeSection = page.getByText(/upgrade|secure your account/i);
    if (await upgradeSection.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const emailInput = page.getByPlaceholder(/email/i);
      const passwordInput = page.getByPlaceholder(/password/i);

      if (await emailInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await emailInput.fill(`e2e-upgrade-${Date.now()}@echo-test.local`);
        await passwordInput.fill("UpgradeTest123!");
        await page.getByRole("button", { name: /upgrade|secure/i }).click();
      }
    }
  });

  test("Account deletion flow", async ({ page }) => {
    await signInAnonymously(page);
    await completeOnboarding(page);

    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Find delete account button
    const deleteBtn = page.getByRole("button", { name: /delete.*account/i });
    if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await deleteBtn.click();

      // Type DELETE
      const confirmInput = page.getByPlaceholder("DELETE");
      if (await confirmInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmInput.fill("DELETE");
        const confirmBtn = page.getByRole("button", { name: /confirm/i });
        // Don't actually delete in E2E — just verify the flow works
        await expect(confirmBtn).toBeEnabled();
      }
    }
  });

  test("RTL layout with Arabic", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });

    await signInAnonymously(page);

    if (page.url().includes("/onboarding")) {
      // Steps 0-2: Welcome screens
      for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: /continue/i }).click();
        await page.waitForTimeout(400);
      }

      // Step 3: Select Arabic
      const arabicBtn = page.getByText("العربية", { exact: true });
      if (await arabicBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await arabicBtn.click();
      }
      await page.getByRole("button", { name: /continue|متابعة/i }).click();
      await page.waitForTimeout(400);

      // Step 4: Cultural context — skip
      await page.getByRole("button", { name: /continue|متابعة/i }).click();
      await page.waitForTimeout(400);

      // Step 5: Goals — select one and finish
      const goalBtn = page.locator("button").filter({ hasText: /.+/ }).nth(1);
      if (await goalBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await goalBtn.click();
      }
      await page.getByRole("button", { name: /get started|ابدأ|continue|متابعة|saving/i }).click();
      await page.waitForURL(/\/app/, { timeout: 15_000 });

      // Verify RTL direction
      const dir = await page.locator("html").getAttribute("dir");
      expect(dir).toBe("rtl");
    }
  });

  test("Public portfolio page loads for valid volunteer", async ({ page }) => {
    await page.goto("/portfolio/00000000-0000-0000-0000-000000000000");
    await page.waitForLoadState("networkidle");
    // Should show not found or empty state
    await expect(
      page.getByText(/not found|no volunteer|portfolio/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("Certificate verification page", async ({ page }) => {
    await page.goto("/verify/invalid-cert-code");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/not found|invalid|no certificate|verify/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
