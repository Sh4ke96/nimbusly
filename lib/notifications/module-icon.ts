import { Cake, CalendarDays, Gift, ShoppingCart, Bell, type LucideIcon } from "lucide-react";
import {
  BIRTHDAY_NOTIFICATION_TYPES,
  GIFT_NOTIFICATION_TYPES,
  SCHEDULE_NOTIFICATION_TYPES,
  SHOPPING_LIST_NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/constants/notifications";

export function getNotificationModuleIcon(type: NotificationType): LucideIcon {
  if ((BIRTHDAY_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Cake;
  }
  if ((SCHEDULE_NOTIFICATION_TYPES as string[]).includes(type)) {
    return CalendarDays;
  }
  if ((GIFT_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Gift;
  }
  if ((SHOPPING_LIST_NOTIFICATION_TYPES as string[]).includes(type)) {
    return ShoppingCart;
  }
  return Bell;
}
