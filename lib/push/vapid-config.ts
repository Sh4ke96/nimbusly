import webpush from "web-push";
import { normalizeVapidPublicKey } from "@/lib/push/normalize-vapid-public-key";

let configured = false;

function normalizeVapidPrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  return trimmed || null;
}

function resolveVapidSubject(): string {
  const explicit = process.env.VAPID_SUBJECT?.trim();
  if (explicit) {
    if (explicit.startsWith("mailto:") || explicit.startsWith("https://")) {
      return explicit;
    }
    return `mailto:${explicit}`;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.match(/<([^>]+)>/)?.[1];
  if (fromEmail) {
    return `mailto:${fromEmail}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl?.startsWith("https://")) {
    return siteUrl;
  }

  return "mailto:hello@nimbusly.pl";
}

export function isWebPushConfigured(): boolean {
  return Boolean(
    normalizeVapidPublicKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) &&
      normalizeVapidPrivateKey(process.env.VAPID_PRIVATE_KEY)
  );
}

export function ensureWebPushConfigured(): boolean {
  if (configured) return true;

  const publicKey = normalizeVapidPublicKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  const privateKey = normalizeVapidPrivateKey(process.env.VAPID_PRIVATE_KEY);
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(resolveVapidSubject(), publicKey, privateKey);
  configured = true;
  return true;
}
