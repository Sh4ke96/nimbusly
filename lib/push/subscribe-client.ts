import { PWA_SW_PATH } from "@/lib/constants/pwa";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";
import { isPushSupported } from "@/lib/push/client-support";

export type ClientPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export const SUBSCRIBE_PUSH_FAILURE = {
  UNSUPPORTED: "unsupported",
  NO_VAPID: "no_vapid",
  NO_SW: "no_sw",
  DENIED: "denied",
  INVALID: "invalid",
  SUBSCRIBE_ERROR: "subscribe_error",
} as const;

export type SubscribePushFailure =
  (typeof SUBSCRIBE_PUSH_FAILURE)[keyof typeof SUBSCRIBE_PUSH_FAILURE];

export type SubscribePushResult =
  | { ok: true; subscription: ClientPushSubscription }
  | { ok: false; reason: SubscribePushFailure };

function subscriptionFromPushSubscription(
  subscription: PushSubscription
): ClientPushSubscription | null {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return null;
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

/** Register service worker if needed and wait until it controls the page. */
export async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    await navigator.serviceWorker.register(PWA_SW_PATH, { scope: "/" });
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function readBrowserPushSubscription(): Promise<ClientPushSubscription | null> {
  const registration = await ensureServiceWorkerRegistration();
  if (!registration) return null;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  return subscriptionFromPushSubscription(subscription);
}

export async function subscribeBrowserToPush(): Promise<SubscribePushResult> {
  if (!isPushSupported()) {
    return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.UNSUPPORTED };
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.NO_VAPID };
  }

  const registration = await ensureServiceWorkerRegistration();
  if (!registration) {
    return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.NO_SW };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.DENIED };
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    const parsed = subscriptionFromPushSubscription(subscription);
    if (!parsed) {
      return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.INVALID };
    }
    return { ok: true, subscription: parsed };
  } catch {
    return { ok: false, reason: SUBSCRIBE_PUSH_FAILURE.SUBSCRIBE_ERROR };
  }
}

export async function unsubscribeBrowserFromPush(): Promise<void> {
  const registration = await ensureServiceWorkerRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await subscription.unsubscribe();
}

export async function hasActivePushSubscription(): Promise<boolean> {
  const subscription = await readBrowserPushSubscription();
  return subscription !== null;
}
