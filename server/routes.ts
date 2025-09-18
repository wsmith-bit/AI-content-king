import type { Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { createHash } from "crypto";
import { storage } from "./storage";
import { registerOptimizeRoutes } from "./routes/api/optimize";
import { registerContentRoutes } from "./routes/api/content";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  if (process.env.NODE_ENV === "test") {
    const seedToken = process.env.TEST_SEED_TOKEN;

    if (!seedToken) {
      throw new Error("TEST_SEED_TOKEN must be configured when NODE_ENV=test");
    }

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const renderPage = (title: string, message: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Cache-Control" content="no-store" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      main { background: rgba(15, 23, 42, 0.9); padding: 2.5rem; border-radius: 1rem; width: min(420px, 90%); box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.75); }
      h1 { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; }
      form { display: grid; gap: 1rem; }
      label { display: grid; gap: 0.5rem; font-weight: 600; }
      input { padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid rgba(148, 163, 184, 0.5); background: rgba(15, 23, 42, 0.75); color: inherit; }
      button { background: #38bdf8; border: none; padding: 0.85rem 1rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; color: #0f172a; }
      p { text-align: center; margin-top: 1rem; font-size: 0.95rem; color: rgba(148, 163, 184, 0.95); }
    </style>
  </head>
  <body>
    <main>
      <h1 data-testid="test-login-title">${escapeHtml(title)}</h1>
      <p data-testid="test-login-message">${escapeHtml(message)}</p>
      <form method="post">
        <label>
          <span>Email</span>
          <input name="email" type="email" autocomplete="username" required data-testid="test-login-email" />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" autocomplete="current-password" required data-testid="test-login-password" />
        </label>
        <label>
          <span>Seed token</span>
          <input name="token" type="password" autocomplete="one-time-code" required data-testid="test-login-token" />
        </label>
        <button type="submit" data-testid="test-login-submit">Sign in as test user</button>
      </form>
      <p>Available only while NODE_ENV=test.</p>
    </main>
  </body>
</html>`;

    const renderSuccess = (userEmail: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Cache-Control" content="no-store" />
    <title>Signed in</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      main { background: rgba(15, 23, 42, 0.9); padding: 2.5rem; border-radius: 1rem; width: min(420px, 90%); box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.75); text-align: center; }
      a { display: inline-block; margin-top: 1.5rem; color: #38bdf8; font-weight: 600; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <h1 data-testid="test-login-success">Test session ready</h1>
      <p data-testid="test-login-success-message">${escapeHtml(userEmail)} is authenticated. You can close this tab.</p>
      <a href="/" data-testid="test-login-home-link">Go to dashboard</a>
    </main>
  </body>
</html>`;

    const respondWithHtml = (res: Response, html: string) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.send(html);
    };

    app.get("/__test__/seed-and-login", (_req, res) => {
      respondWithHtml(res, renderPage("Test sign-in", "Authenticate with the seeded credentials to start an E2E session."));
    });

    app.post("/__test__/seed-and-login", async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, token } = req.body ?? {};

      if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
        respondWithHtml(res.status(500), renderPage("Missing configuration", "TEST_USER_EMAIL and TEST_USER_PASSWORD must be provided."));
        return;
      }

      if (!email || !password || !token) {
        respondWithHtml(res.status(400), renderPage("Invalid submission", "Email, password, and token are required."));
        return;
      }

      if (token !== seedToken) {
        respondWithHtml(res.status(403), renderPage("Access denied", "Seed token is invalid."));
        return;
      }

      if (email !== process.env.TEST_USER_EMAIL || password !== process.env.TEST_USER_PASSWORD) {
        respondWithHtml(res.status(401), renderPage("Authentication failed", "Credentials did not match the configured test user."));
        return;
      }

      const firstName = email.split("@")[0] ?? "Test";
      const userId = createHash("sha256").update(email).digest("hex");

      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName: "User",
        profileImageUrl: null,
      });

      const sessionUser = {
        claims: {
          sub: userId,
          email,
          first_name: firstName,
          last_name: "User",
        },
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      const request = req as Request & { login?: (user: any, cb: (err?: unknown) => void) => void };

      if (!request.login) {
        respondWithHtml(res.status(500), renderPage("Unsupported", "Passport session helpers are unavailable."));
        return;
      }

      request.login(sessionUser, (err?: unknown) => {
        if (err) {
          next(err);
          return;
        }

        respondWithHtml(res, renderSuccess(email));
      });
    });

    app.post("/__test__/logout", (req: Request, res: Response, next: NextFunction) => {
      const request = req as Request & {
        logout?: (cb: (err?: unknown) => void) => void;
        session?: { destroy?: (cb: (err?: unknown) => void) => void };
      };

      const finalize = () => {
        request.session?.destroy?.(() => {
          res.json({ success: true });
        });
      };

      if (request.logout) {
        request.logout((err?: unknown) => {
          if (err) {
            next(err);
            return;
          }

          finalize();
        });
        return;
      }

      finalize();
    });
  }

  // Auth API routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register content optimization routes (protected) - Enhanced with visual elements
  registerContentRoutes(app);
  
  // Legacy optimize routes (now safe - conflicting endpoint removed)
  registerOptimizeRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
