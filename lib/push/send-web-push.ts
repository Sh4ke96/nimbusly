import webpush from "web-push";
import type { WebPushPayload } from "@/lib/push/payload";
import { ensureWebPushConfigured } from "@/lib/push/vapid-config";

export type PushSubscriptionKeys = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type SendResult = { ok: true } | { ok: false; expired: boolean };

export async function sendWebPushToSubscription(
  subscription: PushSubscriptionKeys,
  payload: WebPushPayload
): Promise<SendResult> {
  if (!ensureWebPushConfigured()) {
    return { ok: false, expired: false };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }
    );
    return { ok: true };
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    return { ok: false, expired: statusCode === 404 || statusCode === 410 };
  }
}
