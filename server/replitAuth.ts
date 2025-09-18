import { Router, type Express, type RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as client from "openid-client";
import { Strategy as OidcStrategy, type VerifyFunction } from "openid-client/passport";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";

import type { AppConfig, AuthMode } from "./config";
import { storage } from "./storage";

type OidcTokenResponse = client.TokenEndpointResponse &
  client.TokenEndpointResponseHelpers;

type LocalAuthUser = {
  id: string;
  claims: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
};

const getOidcDiscovery = memoize(
  async (issuer: string, clientId: string) =>
    client.discovery(new URL(issuer), clientId),
  { maxAge: 60 * 60 * 1000, normalizer: (args: [string, string]) => args.join("::") },
);

let currentMode: AuthMode = "local";
let currentConfig: AppConfig | null = null;

function requireConfig(): AppConfig {
  if (!currentConfig) {
    throw new Error("Authentication has not been initialized yet");
  }

  return currentConfig;
}

function getSession(config: AppConfig) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const databaseUrl = process.env.DATABASE_URL;

  let sessionStore: session.Store;

  if (databaseUrl) {
    const PgStore = connectPg(session);
    sessionStore = new PgStore({
      conString: databaseUrl,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    const MemoryStore = memorystore(session);
    sessionStore = new MemoryStore({
      checkPeriod: sessionTtl,
    });
  }

  return session({
    secret: config.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(user: any, tokens: OidcTokenResponse) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

async function setupOidc(app: Express, config: AppConfig) {
  if (!config.OIDC_ISSUER || !config.OIDC_CLIENT_ID || !config.OIDC_REDIRECT_URI) {
    throw new Error("Missing OIDC configuration for AUTH_MODE=oidc");
  }

  const oidcConfig = await getOidcDiscovery(
    config.OIDC_ISSUER,
    config.OIDC_CLIENT_ID,
  );

  const verify: VerifyFunction = async (
    tokens: OidcTokenResponse,
    verified: passport.AuthenticateCallback,
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const domains = config.REPLIT_DOMAINS.split(",").map((domain) => domain.trim()).filter(Boolean);

  for (const domain of domains) {
    const strategy = new OidcStrategy(
      {
        name: `replitauth:${domain}`,
        config: oidcConfig,
        scope: "openid email profile offline_access",
        callbackURL: config.OIDC_REDIRECT_URI ?? `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const redirectUri = config.OIDC_REDIRECT_URI ?? `${req.protocol}://${req.hostname}`;
      res.redirect(
        client
          .buildEndSessionUrl(oidcConfig, {
            client_id: config.OIDC_CLIENT_ID!,
            post_logout_redirect_uri: redirectUri,
          })
          .href,
      );
    });
  });
}

function setupLocal(app: Express, config: AppConfig) {
  const defaultEmail =
    config.TEST_USER_EMAIL ?? (config.NODE_ENV !== "production" ? "test@example.com" : undefined);
  const defaultPassword =
    config.TEST_USER_PASSWORD ?? (config.NODE_ENV !== "production" ? "password" : undefined);

  if (!defaultEmail || !defaultPassword) {
    throw new Error(
      "Local auth mode requires TEST_USER_EMAIL and TEST_USER_PASSWORD (or defaults outside production)",
    );
  }

  const localUserId = `local-${defaultEmail}`;
  const localUser: LocalAuthUser = {
    id: localUserId,
    claims: {
      sub: localUserId,
      email: defaultEmail,
      first_name: "Local",
      last_name: "User",
    },
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        if (email !== defaultEmail || password !== defaultPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        await storage.upsertUser({
          id: localUserId,
          email: defaultEmail,
          firstName: localUser.claims.first_name,
          lastName: localUser.claims.last_name,
        });

        return done(null, { ...localUser });
      },
    ),
  );

  const router = Router();

  router.post("/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: LocalAuthUser | false,
        info?: { message?: string },
      ) => {
        if (err) {
          next(err);
          return;
        }

        if (!user) {
          res.status(401).json({ message: info?.message ?? "Invalid credentials" });
          return;
        }

        req.login(user, (loginError) => {
          if (loginError) {
            next(loginError);
            return;
          }

          const wantsHtml = req.accepts(["html", "json"]) === "html";

          if (wantsHtml) {
            res.redirect("/");
            return;
          }

          res.json({
            user: {
              id: user.claims.sub,
              email: user.claims.email,
            },
          });
        });
      },
    )(req, res, next);
  });

  router.get("/login", (_req, res) => {
    res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Local login</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 420px; margin: 3rem auto; line-height: 1.5; }
      label { display: block; margin-bottom: 1rem; }
      input { width: 100%; padding: 0.5rem; font-size: 1rem; }
      button { padding: 0.5rem 1rem; font-size: 1rem; }
      p { font-size: 0.9rem; color: #444; }
    </style>
  </head>
  <body>
    <h1>Local auth sign in</h1>
    <p>Use the credentials from <code>TEST_USER_EMAIL</code> / <code>TEST_USER_PASSWORD</code>.</p>
    <form method="post" action="">
      <label>
        Email
        <input type="email" name="email" value="${defaultEmail}" autocomplete="email" required />
      </label>
      <label>
        Password
        <input type="password" name="password" value="${config.NODE_ENV !== "production" ? defaultPassword : ""}" autocomplete="current-password" required />
      </label>
      <button type="submit">Sign in</button>
    </form>
  </body>
</html>`);
  });

  router.post("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        next(err);
        return;
      }

      const wantsHtml = req.accepts(["html", "json"]) === "html";

      if (wantsHtml) {
        res.redirect("/");
        return;
      }

      res.status(204).end();
    });
  });

  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        next(err);
        return;
      }

      res.redirect("/");
    });
  });

  router.get("/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const claims = (req.user as LocalAuthUser)?.claims;
    const storedUser = claims ? await storage.getUser(claims.sub) : undefined;

    res.json(
      storedUser ?? {
        id: claims?.sub,
        email: claims?.email ?? null,
      },
    );
  });

  if (config.NODE_ENV === "test" && config.TEST_SEED_TOKEN) {
    router.post("/__test__/seed-and-login", async (req, res, next) => {
      const { token } = req.body ?? {};
      if (token !== config.TEST_SEED_TOKEN) {
        res.status(401).json({ message: "Invalid seed token" });
        return;
      }

      try {
        await storage.upsertUser({
          id: localUserId,
          email: defaultEmail,
          firstName: localUser.claims.first_name,
          lastName: localUser.claims.last_name,
        });
      } catch (error) {
        next(error);
        return;
      }

      req.login({ ...localUser }, (err) => {
        if (err) {
          next(err);
          return;
        }

        res.json({
          user: {
            id: localUser.claims.sub,
            email: localUser.claims.email,
          },
        });
      });
    });
  }

  app.use(router);
  app.use("/api", router);
}

export async function setupAuth(app: Express, config: AppConfig): Promise<void> {
  currentMode = config.AUTH_MODE;
  currentConfig = config;

  app.set("trust proxy", 1);
  app.use(getSession(config));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  if (config.AUTH_MODE === "oidc") {
    await setupOidc(app, config);
  } else {
    setupLocal(app, config);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const config = requireConfig();

  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (currentMode === "local") {
    next();
    return;
  }

  const user = req.user as any;

  if (!user?.expires_at) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    next();
    return;
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const oidcConfig = await getOidcDiscovery(
      config.OIDC_ISSUER!,
      config.OIDC_CLIENT_ID!,
    );
    const tokenResponse = await client.refreshTokenGrant(oidcConfig, refreshToken);
    updateUserSession(user, tokenResponse);
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
