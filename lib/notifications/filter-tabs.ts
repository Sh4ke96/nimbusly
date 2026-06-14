import {
  NOTIFICATION_FILTER_TAB,
  type NotificationFilterTab,
} from "@/lib/constants/notifications";

export { NOTIFICATION_FILTER_TAB, type NotificationFilterTab };

export function parseNotificationFilterTab(
  value: string | null | undefined
): NotificationFilterTab {
  if (value === NOTIFICATION_FILTER_TAB.UNREAD) {
    return NOTIFICATION_FILTER_TAB.UNREAD;
  }
  if (value === NOTIFICATION_FILTER_TAB.READ) {
    return NOTIFICATION_FILTER_TAB.READ;
  }
  return NOTIFICATION_FILTER_TAB.ALL;
}

export function notificationFilterHref(
  filter: NotificationFilterTab,
  page = 1
): string {
  const params = new URLSearchParams();
  if (filter !== NOTIFICATION_FILTER_TAB.ALL) {
    params.set("filter", filter);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `/notifications?${query}` : "/notifications";
}
