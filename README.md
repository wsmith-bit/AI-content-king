AI Content King combines an Express backend and a React frontend to help teams generate and optimize long-form content for AI-forward search engines.

## Continuous Integration

The **Node CI** workflow in `.github/workflows/node-ci.yml` runs automatically for pushes and pull requests to the default branch (usually `main`). It installs dependencies with `npm ci` (falls back to `npm install` if needed), then conditionally runs `npm run build` and `npm test --if-present`. When present, build artifacts in `dist/` and coverage in `coverage/` are uploaded to the run.

## Testing

Playwright E2E coverage signs in as a seeded test user, drives the content generator/optimizer, and asserts on the resulting output.

**Run locally**
1. Copy `.env.sample` → `.env` and provide:
   - `SESSION_SECRET` (for Express sessions)
   - `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` (test user credentials)
   - `TEST_SEED_TOKEN` (shared secret for the guarded `/__test__/seed-and-login` route)
   - Optionally `PLAYWRIGHT_BASE_URL` (defaults to `http://localhost:5173`)
2. Install deps: `npm install`
3. Run: `npm run e2e`

**Artifacts**
- Interactive HTML report: `playwright-report/index.html`
- Traces/screenshots/videos: `test-results/`

> Note: The `/__test__/seed-and-login` helper route only exists with `NODE_ENV=test` and a valid seed token. Never enable it in production.
