import type { Dict } from "@/lib/i18n/types";
import {
  SUBSCRIBE_PUSH_FAILURE,
  type SubscribePushFailure,
} from "@/lib/push/subscribe-client";

export function getSubscribePushErrorMessage(
  reason: SubscribePushFailure,
  t: Dict["pwa"]
): string {
  switch (reason) {
    case SUBSCRIBE_PUSH_FAILURE.DENIED:
      return t.pushDenied;
    case SUBSCRIBE_PUSH_FAILURE.NO_SW:
      return t.pushSwNotReady;
    case SUBSCRIBE_PUSH_FAILURE.NO_VAPID:
      return t.pushNotConfigured;
    case SUBSCRIBE_PUSH_FAILURE.VAPID_INVALID:
      return t.pushVapidInvalid;
    case SUBSCRIBE_PUSH_FAILURE.SW_NOT_CONTROLLING:
      return t.pushReloadApp;
    case SUBSCRIBE_PUSH_FAILURE.UNSUPPORTED:
      return t.pushUnsupported;
    case SUBSCRIBE_PUSH_FAILURE.SUBSCRIBE_ERROR:
      return t.pushSubscribeFailed;
    case SUBSCRIBE_PUSH_FAILURE.INVALID:
    default:
      return t.pushError;
  }
}
