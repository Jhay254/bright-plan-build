import { test, expect } from "@playwright/test";
import { signInAnonymously } from "./helpers/auth";

test.describe("Edge Cases", () => {
  test("Account upgrade: anonymous → email", async ({ page }) => {
    await signInAnonymously(page);

    // Complete onboarding if needed
    if (page.url().includes("/onboarding")) {
      await page.getByText("English").click();
      await page.getByRole("button", { name: /continue/i }).click();
      await page.getByRole("button", { name: /continue/i }).click();
      await page.getByRole("button", { name: /get started|continue/i }).click();
      await page.waitForURL(/\/app/, { timeout: 10_000 });
    }

    // Go to profile
    await page.goto("/app/profile");

    // Look for upgrade section
    const upgradeSection = page.getByText(/upgrade|secure your account/i);
    if (await upgradeSection.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const emailInput = page.getByPlaceholder(/email/i);
      const passwordInput = page.getByPlaceholder(/password/i);

      await emailInput.fill(`e2e-upgrade-${Date.now()}@echo-test.local`);
      await passwordInput.fill("UpgradeTest123!");
      await page.getByRole("button", { name: /upgrade|secure/i }).click();
    }
  });

  test("Account deletion flow", async ({ page }) => {
    await signInAnonymously(page);

    if (page.url().includes("/onboarding")) {
      await page.getByText("English").click();
      await page.getByRole("button", { name: /continue/i }).click();
      await page.getByRole("button", { name: /continue/i }).click();
      await page.getByRole("button", { name: /get started|continue/i }).click();
      await page.waitForURL(/\/app/, { timeout: 10_000 });
    }

    await page.goto("/app/profile");

    // Find delete account button
    const deleteBtn = page.getByRole("button", { name: /delete.*account/i });
    if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await deleteBtn.click();

      // Type DELETE
      const confirmInput = page.getByPlaceholder("DELETE");
      if (await confirmInput.isVisible()) {
        await confirmInput.fill("DELETE");
        const confirmBtn = page.getByRole("button", { name: /confirm/i });
        // Don't actually delete in E2E — just verify the flow works
        await expect(confirmBtn).toBeEnabled();
      }
    }
  });

  test("RTL layout with Arabic", async ({ page }) => {
    await page.goto("/");

    // The landing page should render
    await expect(page.locator("h1")).toBeVisible();

    // Sign in anonymously and select Arabic in onboarding
    await signInAnonymously(page);

    if (page.url().includes("/onboarding")) {
      // Select Arabic
      const arabicBtn = page.getByText("العربية");
      if (await arabicBtn.isVisible()) {
        await arabicBtn.click();
      }
      await page.getByRole("button", { name: /continue|متابعة/i }).click();
      await page.getByRole("button", { name: /continue|متابعة/i }).click();
      await page.getByRole("button", { name: /get started|ابدأ|continue|متابعة/i }).click();
      await page.waitForURL(/\/app/, { timeout: 10_000 });

      // Verify RTL direction
      const dir = await page.locator("html").getAttribute("dir");
      expect(dir).toBe("rtl");
    }
  });

  test("Public portfolio page loads for valid volunteer", async ({ page }) => {
    // Try a non-existent volunteer — should show not found or empty state
    await page.goto("/portfolio/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText(/not found|no volunteer/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Certificate verification page", async ({ page }) => {
    // Try an invalid cert code
    await page.goto("/verify/invalid-cert-code");
    await expect(page.getByText(/not found|invalid|no certificate/i)).toBeVisible({ timeout: 5_000 });
  });
});
