import { GIFT_LINK_URL_MAX_LENGTH } from "@/lib/constants/gifts";

export function normalizeGiftLinkUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  return withScheme.slice(0, GIFT_LINK_URL_MAX_LENGTH);
}

export function isValidGiftLinkUrl(url: string): boolean {
  if (!url) return true;

  if (url.length > GIFT_LINK_URL_MAX_LENGTH) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatGiftLinkLabel(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}
