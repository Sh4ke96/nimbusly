const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function sanitizeMarkdownLinkUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "";
  }

  if (!ALLOWED_LINK_PROTOCOLS.has(parsed.protocol)) {
    return "";
  }

  return parsed.toString();
}
