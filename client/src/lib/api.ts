const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackOrigin =
  typeof window !== "undefined" && typeof window.location !== "undefined"
    ? window.location.origin
    : "";

function getProtocolFromOrigin(origin: string | undefined): string | undefined {
  if (!origin) {
    return undefined;
  }

  try {
    return new URL(origin).protocol;
  } catch {
    return undefined;
  }
}

function looksLikeHostname(value: string): boolean {
  const [hostCandidate] = value.split("/");
  if (!hostCandidate) {
    return false;
  }

  const hasDot = hostCandidate.includes(".");
  const hasPort = hostCandidate.includes(":");
  const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const isLocalhost = /^localhost$/i.test(hostCandidate);

  return hasDot || hasPort || ipv4Pattern.test(hostCandidate) || isLocalhost;
}

function normalizeRawApiBase(value: string, origin: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  if (hasScheme) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    const protocol = getProtocolFromOrigin(origin) ?? "https:";
    return `${protocol}${trimmed}`;
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  if (looksLikeHostname(trimmed)) {
    const protocol = getProtocolFromOrigin(origin) ?? "https:";
    return `${protocol}//${trimmed}`;
  }

  return trimmed;
}

function computeApiBase(): string | undefined {
  if (rawApiBase && rawApiBase.length > 0) {
    const normalizedBase = normalizeRawApiBase(rawApiBase, fallbackOrigin);

    try {
      const parsedBase = fallbackOrigin
        ? new URL(normalizedBase, fallbackOrigin)
        : new URL(normalizedBase);
      return parsedBase.toString().replace(/\/$/, "");
    } catch (error) {
      console.warn("Failed to parse VITE_API_BASE_URL", error);
    }
  }

  return fallbackOrigin || undefined;
}

const resolvedApiBase = computeApiBase();

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!resolvedApiBase) {
    return normalizedPath;
  }

  try {
    const baseWithTrailingSlash = resolvedApiBase.endsWith("/")
      ? resolvedApiBase
      : `${resolvedApiBase}/`;
    return new URL(normalizedPath, baseWithTrailingSlash).toString();
  } catch (error) {
    console.warn("Failed to construct API URL", error);
    return `${resolvedApiBase}${normalizedPath}`;
  }
}
