import fs from "fs";
import path from "path";

function normalizeValue(raw) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\n/g, "\n");
  }

  return trimmed;
}

function parse(content) {
  const parsed = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(?:export\s+)?([^=]+)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1]?.trim();
    if (!key) {
      continue;
    }

    const rawValue = match[2] ?? "";
    parsed[key] = normalizeValue(rawValue);
  }

  return parsed;
}

export function load(options = {}) {
  const override = Boolean(options.override);
  const envPath = options.path
    ? path.resolve(process.cwd(), options.path)
    : path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const parsed = parse(fs.readFileSync(envPath, "utf8"));

  for (const [key, value] of Object.entries(parsed)) {
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return parsed;
}

export default load;
