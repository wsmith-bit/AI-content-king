import "dotenv/config";

export type AuthMode = "oidc" | "local";

export interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  AUTH_MODE: AuthMode;
  SESSION_SECRET: string;
  REPLIT_DOMAINS: string;
  OIDC_ISSUER?: string;
  OIDC_CLIENT_ID?: string;
  OIDC_CLIENT_SECRET?: string;
  OIDC_REDIRECT_URI?: string;
  TEST_USER_EMAIL?: string;
  TEST_USER_PASSWORD?: string;
  TEST_SEED_TOKEN?: string;
}

const NODE_ENV = process.env.NODE_ENV ?? "development";
const PORT = Number.parseInt(process.env.PORT ?? "5000", 10);
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET env var is required. Set it in your .env file (see .env.sample).",
  );
}

const OIDC_ISSUER =
  process.env.OIDC_ISSUER ?? process.env.ISSUER_URL ?? undefined;
const OIDC_CLIENT_ID =
  process.env.OIDC_CLIENT_ID ?? process.env.REPL_ID ?? undefined;
const OIDC_CLIENT_SECRET =
  process.env.OIDC_CLIENT_SECRET ?? process.env.REPLIT_CLIENT_SECRET ?? undefined;
const OIDC_REDIRECT_URI =
  process.env.OIDC_REDIRECT_URI ?? process.env.REPLIT_REDIRECT_URI ?? undefined;

const rawAuthMode = process.env.AUTH_MODE?.toLowerCase();
const explicitAuthMode =
  rawAuthMode === "oidc" || rawAuthMode === "local"
    ? (rawAuthMode as AuthMode)
    : undefined;

let AUTH_MODE: AuthMode;
if (explicitAuthMode) {
  AUTH_MODE = explicitAuthMode;
} else if (OIDC_ISSUER && OIDC_CLIENT_ID && OIDC_CLIENT_SECRET && OIDC_REDIRECT_URI) {
  AUTH_MODE = "oidc";
} else {
  AUTH_MODE = "local";
}

if (AUTH_MODE === "oidc") {
  const missing = [
    ["OIDC_ISSUER", OIDC_ISSUER],
    ["OIDC_CLIENT_ID", OIDC_CLIENT_ID],
    ["OIDC_CLIENT_SECRET", OIDC_CLIENT_SECRET],
    ["OIDC_REDIRECT_URI", OIDC_REDIRECT_URI],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for AUTH_MODE=oidc: ${missing.join(", ")}`,
    );
  }
}

const REPLIT_DOMAINS =
  process.env.REPLIT_DOMAINS ?? "*.repl.co,*.replit.app,*.github.dev";

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_SEED_TOKEN = process.env.TEST_SEED_TOKEN;

if (AUTH_MODE === "local" && NODE_ENV === "production") {
  const missing = [
    ["TEST_USER_EMAIL", TEST_USER_EMAIL],
    ["TEST_USER_PASSWORD", TEST_USER_PASSWORD],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for production local auth: ${missing.join(", ")}`,
    );
  }
}

export const config: AppConfig = {
  NODE_ENV,
  PORT,
  AUTH_MODE,
  SESSION_SECRET,
  REPLIT_DOMAINS,
  OIDC_ISSUER,
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_REDIRECT_URI,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TEST_SEED_TOKEN,
};

export default config;
