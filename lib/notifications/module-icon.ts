import { Cake, CalendarDays, Bell, type LucideIcon } from "lucide-react";
import {
  BIRTHDAY_NOTIFICATION_TYPES,
  SCHEDULE_NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/constants/notifications";

export function getNotificationModuleIcon(type: NotificationType): LucideIcon {
  if ((BIRTHDAY_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Cake;
  }
  if ((SCHEDULE_NOTIFICATION_TYPES as string[]).includes(type)) {
    return CalendarDays;
  }
  return Bell;
}
