export const NOTIFICATION_CHANNEL = {
  IN_APP: "in_app",
  PUSH: "push",
  EMAIL_DIGEST: "email_digest",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const NOTIFICATION_CHANNELS = Object.values(
  NOTIFICATION_CHANNEL
) as NotificationChannel[];
