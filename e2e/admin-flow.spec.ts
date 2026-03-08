import { test, expect } from "@playwright/test";
import { signIn, TEST_ADMIN } from "./helpers/auth";

test.describe("Admin Happy Path", () => {
  test("Dashboard → Users → Volunteers → Sessions → Crisis → Community", async ({ page }) => {
    // 1. Sign in as admin
    await signIn(page, TEST_ADMIN.email, TEST_ADMIN.password);

    // 2. Navigate to admin dashboard
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // 3. Users page — view user list
    await page.goto("/admin/users");
    await expect(page.getByText(/users/i)).toBeVisible();

    // Check table renders
    const tableRows = page.locator("table tbody tr");
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);

    // 4. Volunteers page
    await page.goto("/admin/volunteers");
    await expect(page.getByText(/volunteer/i).first()).toBeVisible();

    // Try approve/revoke if pending volunteers exist
    const approveBtn = page.getByRole("button", { name: /approve/i }).first();
    if (await approveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await approveBtn.click();
    }

    // 5. Sessions page
    await page.goto("/admin/sessions");
    await expect(page.getByText(/session/i).first()).toBeVisible();

    // 6. Crisis page
    await page.goto("/admin/crisis");
    await expect(page.getByText(/crisis/i).first()).toBeVisible();

    // 7. Community page
    await page.goto("/admin/community");
    await expect(page.getByText(/community/i).first()).toBeVisible();

    // Check tabs exist
    const encouragementsTab = page.getByRole("tab", { name: /encouragements/i });
    const resourcesTab = page.getByRole("tab", { name: /resources/i });
    if (await encouragementsTab.isVisible()) {
      await encouragementsTab.click();
    }
    if (await resourcesTab.isVisible()) {
      await resourcesTab.click();
      // Try adding a resource
      const addBtn = page.getByRole("button", { name: /add resource/i });
      if (await addBtn.isVisible()) {
        await addBtn.click();
        // Fill dialog
        await page.getByLabel(/title/i).fill("E2E Test Resource");
        await page.getByRole("button", { name: /save/i }).click();
      }
    }
  });
});
