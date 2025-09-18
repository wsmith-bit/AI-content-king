# AI Content King

AI Content King combines an Express backend and a React frontend to help teams generate and optimize long-form content for AI-forward search engines.

## Testing

Playwright E2E coverage signs in as a seeded test user, drives the content optimizer, and asserts on the generated output. To run the suite locally:

1. Copy `.env.sample` to `.env` (or export the variables in your shell) and provide values for:
   - `SESSION_SECRET` (required for Express sessions)
   - `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` (credentials used by the automated test user)
   - `TEST_SEED_TOKEN` (shared secret required by the guarded `/__test__/seed-and-login` route)
   - Optionally override `PLAYWRIGHT_BASE_URL` if the app runs somewhere other than `http://localhost:5173`.
2. Install dependencies with `npm install`.
3. Run the end-to-end workflow:

   ```bash
   npm run e2e
   ```

The run produces:

- An interactive HTML report in `playwright-report/index.html` (open it in a browser to inspect steps, traces, screenshots, and videos).
- Raw traces, videos, and screenshots under `test-results/` for debugging failures.

> **Note:** The `/__test__/seed-and-login` helper route only exists when `NODE_ENV=test` and the seed token is provided. It should never be enabled in production environments.
