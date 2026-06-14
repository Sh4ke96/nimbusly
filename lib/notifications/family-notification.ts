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
  };

  return formatMessage(templateByType[type], { actor: actorName });
}
