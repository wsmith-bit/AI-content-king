import path from "path";
import fs from "fs/promises";
import { expect, type Page } from "@playwright/test";

export const authDirectory = path.resolve(__dirname, "../.auth");
export const storageStatePath = path.join(authDirectory, "user.json");

export async function ensureAuthStorageStateFile() {
  await fs.mkdir(authDirectory, { recursive: true });
  try {
    await fs.access(storageStatePath);
  } catch {
    const emptyState = { cookies: [], origins: [] };
    await fs.writeFile(storageStatePath, JSON.stringify(emptyState, null, 2), "utf-8");
  }
}

async function isDashboardVisible(page: Page): Promise<boolean> {
  try {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(200);
    const welcomeTitle = page.getByTestId("welcome-title");
    await welcomeTitle.first().waitFor({ state: "visible", timeout: 1500 });
    return true;
  } catch {
    return false;
  }
}

export async function loginAsTestUser(page: Page) {
  await ensureAuthStorageStateFile();

  if (await isDashboardVisible(page)) {
    return;
  }

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  const seedToken = process.env.TEST_SEED_TOKEN;

  if (!email || !password || !seedToken) {
    throw new Error(
      "TEST_USER_EMAIL, TEST_USER_PASSWORD, and TEST_SEED_TOKEN must be set before running E2E tests."
    );
  }

  await page.goto("/__test__/seed-and-login");
  await page.getByTestId("test-login-email").fill(email);
  await page.getByTestId("test-login-password").fill(password);
  await page.getByTestId("test-login-token").fill(seedToken);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.getByTestId("test-login-submit").click(),
  ]);

  await expect(page.getByTestId("test-login-success")).toBeVisible();
  await page.context().storageState({ path: storageStatePath });

  await page.goto("/");
  await expect(page.getByTestId("welcome-title")).toBeVisible();
}
