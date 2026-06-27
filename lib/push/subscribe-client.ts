import { urlBase64ToUint8Array } from "@/lib/push/url-base64";
import { isPushSupported } from "@/lib/push/client-support";

export type ClientPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function getActiveServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return null;
}

export async function subscribeBrowserToPush(): Promise<ClientPushSubscription | null> {
  if (!isPushSupported()) return null;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return null;

  const registration = await getActiveServiceWorkerRegistration();
  if (!registration) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return null;
  }

  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

export async function unsubscribeBrowserFromPush(): Promise<void> {
  const registration = await getActiveServiceWorkerRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await subscription.unsubscribe();
}

export async function hasActivePushSubscription(): Promise<boolean> {
  const registration = await getActiveServiceWorkerRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return subscription !== null;
}
