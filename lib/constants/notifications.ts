export const NOTIFICATION_TYPE = {
  BIRTHDAY_ADDED: "birthday_added",
  BIRTHDAY_UPDATED: "birthday_updated",
  BIRTHDAY_DELETED: "birthday_deleted",
  SCHEDULE_ADDED: "schedule_added",
  SCHEDULE_UPDATED: "schedule_updated",
  SCHEDULE_DELETED: "schedule_deleted",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const BIRTHDAY_NOTIFICATION_TYPES: NotificationType[] = [
  NOTIFICATION_TYPE.BIRTHDAY_ADDED,
  NOTIFICATION_TYPE.BIRTHDAY_UPDATED,
  NOTIFICATION_TYPE.BIRTHDAY_DELETED,
];

export const SCHEDULE_NOTIFICATION_TYPES: NotificationType[] = [
  NOTIFICATION_TYPE.SCHEDULE_ADDED,
  NOTIFICATION_TYPE.SCHEDULE_UPDATED,
  NOTIFICATION_TYPE.SCHEDULE_DELETED,
];

export const NOTIFICATION_FILTER_TAB = {
  ALL: "all",
  UNREAD: "unread",
  READ: "read",
} as const;

export type NotificationFilterTab =
  (typeof NOTIFICATION_FILTER_TAB)[keyof typeof NOTIFICATION_FILTER_TAB];

export const NOTIFICATIONS_PAGE_SIZE = 10;
