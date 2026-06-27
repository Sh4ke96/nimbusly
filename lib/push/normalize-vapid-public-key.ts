import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

/** VAPID P-256 public key decodes to 65 bytes (0x04 + X + Y). */
const VAPID_PUBLIC_KEY_BYTE_LENGTH = 65;

export function normalizeVapidPublicKey(raw: string | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return null;

  try {
    const bytes = urlBase64ToUint8Array(trimmed);
    if (bytes.length !== VAPID_PUBLIC_KEY_BYTE_LENGTH) {
      return null;
    }
    if (bytes[0] !== 0x04) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}
