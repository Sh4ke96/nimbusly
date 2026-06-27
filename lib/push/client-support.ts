import {
  PUSH_DISMISS_KEY,
  PUSH_UNSUPPORTED_REASON,
  type PushUnsupportedReason,
} from "@/lib/constants/push";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

export function getPushUnsupportedReason(): PushUnsupportedReason | null {
  if (typeof window === "undefined") return PUSH_UNSUPPORTED_REASON.NO_API;
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return PUSH_UNSUPPORTED_REASON.NO_VAPID;
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return PUSH_UNSUPPORTED_REASON.NO_API;
  }
  if (isIosDevice() && !isStandaloneDisplay()) {
    return PUSH_UNSUPPORTED_REASON.IOS_NOT_INSTALLED;
  }
  return null;
}

export function isPushSupported(): boolean {
  return getPushUnsupportedReason() === null;
}

export function shouldOfferPushPrompt(): boolean {
  if (!isPushSupported()) return false;
  if (Notification.permission !== "default") return false;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PUSH_DISMISS_KEY) !== "1";
}
