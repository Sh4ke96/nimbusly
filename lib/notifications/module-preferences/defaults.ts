import {
  NOTIFICATION_MODULE_IDS,
  type NotificationModuleId,
} from "@/lib/constants/notification-modules";
import type { NotificationModulePreference } from "@/lib/notifications/module-preferences/types";

export function defaultModulePreference(
  moduleId: NotificationModuleId
): NotificationModulePreference {
  return {
    moduleId,
    inAppEnabled: true,
    pushEnabled: false,
    emailDigestEnabled: false,
  };
}

export function defaultModulePreferences(): NotificationModulePreference[] {
  return NOTIFICATION_MODULE_IDS.map((moduleId) => defaultModulePreference(moduleId));
}
