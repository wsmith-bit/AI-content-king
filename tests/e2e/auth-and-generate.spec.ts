import { test, expect } from "@playwright/test";
import {
  ensureAuthStorageStateFile,
  loginAsTestUser,
  storageStatePath,
} from "../utils/auth";

await ensureAuthStorageStateFile();

test.use({ storageState: storageStatePath });

test.describe("authenticated content workflow", () => {
  test("signs in and generates optimized content", async ({ page }) => {
    await loginAsTestUser(page);

    const contentTextarea = page.getByTestId("input-content");
    await contentTextarea.fill(`# 2025 Smart TV Buying Guide\n\nDiscover the top-rated televisions for streaming, gaming, and movies.`);

    await page.getByTestId("button-optimize").click();

    const insightsHeading = page.getByRole("heading", { name: "Optimization Insights" });
    await insightsHeading.waitFor({ state: "visible", timeout: 120000 });
    await expect(insightsHeading).toBeVisible();

    await expect(page.getByText("AI Optimization Score")).toBeVisible();
    await expect(page.getByRole("button", { name: /Enhance with Real Data/i })).toBeVisible();
  });
});
