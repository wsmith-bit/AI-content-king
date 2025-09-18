AI Content King combines an Express backend and a React frontend to help teams generate and optimize long-form content for AI-forward search engines.

## Getting Started

1. Copy `.env.sample` to `.env` and set at least `SESSION_SECRET`.
   - `AUTH_MODE` defaults to `local` whenever the OIDC variables are missing.
   - For local and CI usage you can keep the generated test credentials or override `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
   - The server binds to `0.0.0.0:${PORT}` (defaults to `5000`).
   - In GitHub Codespaces, run the same command and open the forwarded port in the browser.

### Authentication modes

- **Local mode** (default): does not require OIDC credentials. A lightweight Passport local strategy authenticates against the test user defined by `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`. The `/login`, `/logout`, and `/me` helpers (also available under `/api`) let you exercise sessions without external providers.
- **OIDC mode**: set `AUTH_MODE=oidc` and provide `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `OIDC_REDIRECT_URI`. Existing Replit OIDC flows continue to work with these variables.

The guarded route `/__test__/seed-and-login` seeds and signs in the local test user, but it is only available when `NODE_ENV=test` **and** `TEST_SEED_TOKEN` are configured. Never enable the helper in production.

## Continuous Integration

The **Node CI** workflow in `.github/workflows/node-ci.yml` runs automatically for pushes and pull requests to the default branch (usually `main`). It installs dependencies with `npm ci` (falls back to `npm install` if needed), then conditionally runs `npm run build` and `npm test --if-present`. When present, build artifacts in `dist/` and coverage in `coverage/` are uploaded to the run. CI enforces `AUTH_MODE=local` so no external secrets are required.

## Testing

Playwright E2E coverage signs in as a seeded test user, drives the content generator/optimizer, and asserts on the resulting output.

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
