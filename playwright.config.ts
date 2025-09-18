import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const parsedUrl = new URL(baseURL);
const serverPort = parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "5173");

const defaultTestEmail = process.env.TEST_USER_EMAIL ?? "test.user@example.com";
const defaultTestPassword = process.env.TEST_USER_PASSWORD ?? "super-secret-password";
const defaultSeedToken = process.env.TEST_SEED_TOKEN ?? "seed-secrets-token";
const defaultSessionSecret = process.env.SESSION_SECRET ?? "test-session-secret";

process.env.TEST_USER_EMAIL = defaultTestEmail;
process.env.TEST_USER_PASSWORD = defaultTestPassword;
process.env.TEST_SEED_TOKEN = defaultSeedToken;
process.env.SESSION_SECRET = defaultSessionSecret;

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev:test",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: "test",
      PORT: serverPort,
      SESSION_SECRET: defaultSessionSecret,
      TEST_USER_EMAIL: defaultTestEmail,
      TEST_USER_PASSWORD: defaultTestPassword,
      TEST_SEED_TOKEN: defaultSeedToken,
      PLAYWRIGHT_BASE_URL: baseURL,
    },
  },
});
