/**
 * Safely extract hostname from a URL string.
 * Returns a fallback value if the URL is malformed.
 */
export function extractHostname(url: string, fallback = "unknown"): string {
  try {
    return new URL(url).hostname;
  } catch {
    return fallback;
  }
}
