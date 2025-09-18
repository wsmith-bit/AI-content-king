const rawApiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const normalizedApiBase = rawApiBase.replace(/\/$/, "");

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedApiBase}${normalizedPath}`;
}
