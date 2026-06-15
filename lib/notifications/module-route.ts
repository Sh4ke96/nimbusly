import { Bell, type LucideIcon } from "lucide-react";
import {
  APP_MODULE,
  APP_MODULE_ROUTES,
  getAppModuleIcon,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import {
  BIRTHDAY_NOTIFICATION_TYPES,
  BUDGET_NOTIFICATION_TYPES,
  CHORE_NOTIFICATION_TYPES,
  NOTE_NOTIFICATION_TYPES,
  GIFT_NOTIFICATION_TYPES,
  MEDICINE_NOTIFICATION_TYPES,
  PET_NOTIFICATION_TYPES,
  RESTAURANT_NOTIFICATION_TYPES,
  SCHEDULE_NOTIFICATION_TYPES,
  SHOPPING_LIST_NOTIFICATION_TYPES,
  WATCHLIST_NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/constants/notifications";
import type { Dict } from "@/lib/i18n/types";

export type NotificationModuleId = Exclude<AppModuleId, typeof APP_MODULE.FAMILY>;

const NOTIFICATION_TYPES_BY_MODULE: Record<NotificationModuleId, readonly NotificationType[]> = {
  [APP_MODULE.BIRTHDAYS]: BIRTHDAY_NOTIFICATION_TYPES,
  [APP_MODULE.CALENDAR]: SCHEDULE_NOTIFICATION_TYPES,
  [APP_MODULE.GIFTS]: GIFT_NOTIFICATION_TYPES,
  [APP_MODULE.BUDGET]: BUDGET_NOTIFICATION_TYPES,
  [APP_MODULE.SHOPPING]: SHOPPING_LIST_NOTIFICATION_TYPES,
  [APP_MODULE.MEDICINE_CABINET]: MEDICINE_NOTIFICATION_TYPES,
  [APP_MODULE.WATCHLIST]: WATCHLIST_NOTIFICATION_TYPES,
  [APP_MODULE.RESTAURANTS]: RESTAURANT_NOTIFICATION_TYPES,
  [APP_MODULE.PETS]: PET_NOTIFICATION_TYPES,
  [APP_MODULE.CHORES]: CHORE_NOTIFICATION_TYPES,
  [APP_MODULE.NOTES]: NOTE_NOTIFICATION_TYPES,
};

const NOTIFICATION_MODULE_BY_TYPE = new Map<NotificationType, NotificationModuleId>();
for (const [moduleId, types] of Object.entries(NOTIFICATION_TYPES_BY_MODULE) as [
  NotificationModuleId,
  readonly NotificationType[],
][]) {
  for (const type of types) {
    NOTIFICATION_MODULE_BY_TYPE.set(type, moduleId);
  }
}

export const NOTIFICATION_MODULE_LINK_LABEL: Record<
  NotificationModuleId,
  keyof Dict["notifications"]
> = {
  [APP_MODULE.BIRTHDAYS]: "openBirthdays",
  [APP_MODULE.CALENDAR]: "openSchedule",
  [APP_MODULE.GIFTS]: "openGifts",
  [APP_MODULE.BUDGET]: "openBudget",
  [APP_MODULE.SHOPPING]: "openShoppingLists",
  [APP_MODULE.MEDICINE_CABINET]: "openMedicineCabinet",
  [APP_MODULE.WATCHLIST]: "openWatchlist",
  [APP_MODULE.RESTAURANTS]: "openRestaurants",
  [APP_MODULE.PETS]: "openPets",
  [APP_MODULE.CHORES]: "openChores",
  [APP_MODULE.NOTES]: "openNotes",
};

export function getNotificationModuleId(
  type: NotificationType
): NotificationModuleId | null {
  return NOTIFICATION_MODULE_BY_TYPE.get(type) ?? null;
}

export function getNotificationModuleHref(type: NotificationType): string | null {
  const moduleId = getNotificationModuleId(type);
  return moduleId ? APP_MODULE_ROUTES[moduleId] : null;
}

export function getNotificationModuleIcon(type: NotificationType): LucideIcon {
  const moduleId = getNotificationModuleId(type);
  return moduleId ? getAppModuleIcon(moduleId) : Bell;
}
