export const NOTIFICATION_TYPE = {
  BIRTHDAY_ADDED: "birthday_added",
  BIRTHDAY_UPDATED: "birthday_updated",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
