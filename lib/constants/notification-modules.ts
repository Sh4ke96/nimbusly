import { APP_MODULE, APP_MODULE_NAV_IDS, type AppModuleId } from "@/lib/constants/app-modules";

/** Modules that support notification preferences (excludes family and unified calendar view). */
export type NotificationModuleId = Exclude<
  AppModuleId,
  typeof APP_MODULE.FAMILY | typeof APP_MODULE.FAMILY_CALENDAR
>;

export const NOTIFICATION_MODULE_IDS = APP_MODULE_NAV_IDS.filter(
  (moduleId): moduleId is NotificationModuleId =>
    moduleId !== APP_MODULE.FAMILY_CALENDAR
) as readonly NotificationModuleId[];

export const NOTIFICATION_MODULE_ID_SET = new Set<string>(NOTIFICATION_MODULE_IDS);

export function isNotificationModuleId(value: string): value is NotificationModuleId {
  return NOTIFICATION_MODULE_ID_SET.has(value);
}
