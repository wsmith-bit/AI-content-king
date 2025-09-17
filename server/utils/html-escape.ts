/**
 * HTML escaping utility to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(str: string | undefined | null): string {
  if (str == null) return '';
  
  // Convert to string if not already
  const text = String(str);
  
  // Map of characters to escape
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  // Replace all dangerous characters
  return text.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char]);
}

/**
 * Escapes HTML attributes to prevent XSS attacks
 * @param attr - The attribute value to escape
 * @returns The escaped attribute safe for HTML attribute insertion
 */
export function escapeHtmlAttribute(attr: string | undefined | null): string {
  if (attr == null) return '';
  
  // Convert to string and escape quotes and other dangerous characters
  return String(attr)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes an array of keywords for safe HTML insertion
 * @param keywords - Array of keywords to sanitize
 * @returns Comma-separated string of escaped keywords
 */
export function escapeKeywords(keywords: string[] | undefined | null): string {
  if (!keywords || !Array.isArray(keywords)) return '';
  
  return keywords
    .map(keyword => escapeHtmlAttribute(keyword))
    .join(', ');
}

/**
 * Creates a safe HTML ID from user content
 * @param text - The text to convert to an ID
 * @param prefix - Optional prefix for the ID
 * @returns A safe HTML ID
 */
export function createSafeId(text: string, prefix: string = 'id'): string {
  // Remove all non-alphanumeric characters except hyphens and underscores
  const safeText = text
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${prefix}-${safeText || 'item'}`;
}

/**
 * Validates and sanitizes a URL
 * @param url - The URL to validate and sanitize
 * @returns The sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http, https, and relative URLs
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return escapeHtmlAttribute(url);
  } catch {
    // If URL parsing fails, check if it's a relative URL starting with /
    if (url.startsWith('/')) {
      return escapeHtmlAttribute(url);
    }
    return '';
  }
}