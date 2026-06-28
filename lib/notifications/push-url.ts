import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { NOTIFICATION_DEEP_LINK_QUERY } from "@/lib/constants/notification-deep-links";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

function stringId(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function resolvePushNotificationUrl(
  type: NotificationType,
  payload: Record<string, unknown>
): string {
  const shoppingListId = stringId(payload, "shopping_list_id");
  if (
    shoppingListId &&
    (type === NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED ||
      type === NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_REMOVED ||
      type === NOTIFICATION_TYPE.SHOPPING_LIST_ADDED ||
      type === NOTIFICATION_TYPE.SHOPPING_LIST_UPDATED ||
      type === NOTIFICATION_TYPE.SHOPPING_LIST_DELETED)
  ) {
    return `/shopping?${NOTIFICATION_DEEP_LINK_QUERY.SHOPPING_LIST}=${encodeURIComponent(shoppingListId)}`;
  }

  const budgetId = stringId(payload, "budget_id");
  if (
    budgetId &&
    (type === NOTIFICATION_TYPE.BUDGET_ADDED ||
      type === NOTIFICATION_TYPE.BUDGET_UPDATED ||
      type === NOTIFICATION_TYPE.BUDGET_DELETED ||
      type === NOTIFICATION_TYPE.BUDGET_EXPENSE_ADDED ||
      type === NOTIFICATION_TYPE.BUDGET_EXPENSE_REMOVED ||
      type === NOTIFICATION_TYPE.BUDGET_INCOME_ADDED ||
      type === NOTIFICATION_TYPE.BUDGET_INCOME_REMOVED ||
      type === NOTIFICATION_TYPE.BUDGET_EXPENSE_DUE_REMINDER)
  ) {
    return `/budget?${NOTIFICATION_DEEP_LINK_QUERY.BUDGET}=${encodeURIComponent(budgetId)}`;
  }

  return PUSH_NOTIFICATION_DEFAULT_URL;
}
