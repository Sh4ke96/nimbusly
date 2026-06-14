import { Cake, CalendarDays, Clapperboard, Cross, Gift, ShoppingCart, UtensilsCrossed, Wallet, Bell, type LucideIcon } from "lucide-react";
import {
  BIRTHDAY_NOTIFICATION_TYPES,
  BUDGET_NOTIFICATION_TYPES,
  GIFT_NOTIFICATION_TYPES,
  MEDICINE_NOTIFICATION_TYPES,
  RESTAURANT_NOTIFICATION_TYPES,
  SCHEDULE_NOTIFICATION_TYPES,
  SHOPPING_LIST_NOTIFICATION_TYPES,
  WATCHLIST_NOTIFICATION_TYPES,
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
  if ((BUDGET_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Wallet;
  }
  if ((SHOPPING_LIST_NOTIFICATION_TYPES as string[]).includes(type)) {
    return ShoppingCart;
  }
  if ((MEDICINE_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Cross;
  }
  if ((WATCHLIST_NOTIFICATION_TYPES as string[]).includes(type)) {
    return Clapperboard;
  }
  if ((RESTAURANT_NOTIFICATION_TYPES as string[]).includes(type)) {
    return UtensilsCrossed;
  }
  return Bell;
}
