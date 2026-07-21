/**
 * Validates post-auth redirect paths to prevent open redirects.
 * Only same-origin relative paths are allowed.
 */
export function resolveSafeRedirectPath(nextParam: string | null, fallback: string): string {
  if (!nextParam) {
    return fallback;
  }

  const trimmed = nextParam.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  if (!/^\/[a-zA-Z0-9/_\-.?=&%]*$/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
