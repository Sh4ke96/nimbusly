export const PUSH_SUBSCRIPTION_FORM_FIELD = {
  ENDPOINT: "endpoint",
  P256DH: "p256dh",
  AUTH: "auth",
} as const;

export const PUSH_DISMISS_KEY = "nimbusly:push-prompt-dismissed" as const;

export const PUSH_UNSUPPORTED_REASON = {
  NO_VAPID: "no_vapid",
  VAPID_INVALID: "vapid_invalid",
  NO_API: "no_api",
  IOS_NOT_INSTALLED: "ios_not_installed",
} as const;

export type PushUnsupportedReason =
  (typeof PUSH_UNSUPPORTED_REASON)[keyof typeof PUSH_UNSUPPORTED_REASON];

export const PUSH_NOTIFICATION_DEFAULT_URL = "/notifications" as const;
