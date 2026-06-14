import {
  NOTIFICATION_TYPE,
  type NotificationType,
} from "@/lib/constants/notifications";
import { formatMessage } from "@/lib/i18n/format";
import type { Dict } from "@/lib/i18n/types";

export function getFamilyNotificationTitle(
  type: NotificationType,
  notifications: Dict["notifications"],
  actorName: string
): string {
  const templateByType: Record<NotificationType, string> = {
    [NOTIFICATION_TYPE.BIRTHDAY_ADDED]: notifications.birthdayAddedTitle,
    [NOTIFICATION_TYPE.BIRTHDAY_UPDATED]: notifications.birthdayUpdatedTitle,
    [NOTIFICATION_TYPE.BIRTHDAY_DELETED]: notifications.birthdayDeletedTitle,
    [NOTIFICATION_TYPE.SCHEDULE_ADDED]: notifications.scheduleAddedTitle,
    [NOTIFICATION_TYPE.SCHEDULE_UPDATED]: notifications.scheduleUpdatedTitle,
    [NOTIFICATION_TYPE.SCHEDULE_DELETED]: notifications.scheduleDeletedTitle,
    [NOTIFICATION_TYPE.GIFT_ADDED]: notifications.giftAddedTitle,
    [NOTIFICATION_TYPE.GIFT_UPDATED]: notifications.giftUpdatedTitle,
    [NOTIFICATION_TYPE.GIFT_DELETED]: notifications.giftDeletedTitle,
    [NOTIFICATION_TYPE.SHOPPING_LIST_ADDED]: notifications.shoppingListAddedTitle,
    [NOTIFICATION_TYPE.SHOPPING_LIST_UPDATED]: notifications.shoppingListUpdatedTitle,
    [NOTIFICATION_TYPE.SHOPPING_LIST_DELETED]: notifications.shoppingListDeletedTitle,
    [NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED]: notifications.shoppingListItemAddedTitle,
    [NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_REMOVED]: notifications.shoppingListItemRemovedTitle,
  };

  return formatMessage(templateByType[type], { actor: actorName });
}
