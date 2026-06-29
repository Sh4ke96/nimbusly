import type { NotificationModuleId } from "@/lib/constants/notification-modules";

export interface NotificationModulePreference {
  moduleId: NotificationModuleId;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailDigestEnabled: boolean;
}

export interface NotificationModulePreferenceRow {
  user_id: string;
  module_id: string;
  in_app_enabled: boolean;
  push_enabled: boolean;
  email_digest_enabled: boolean;
  updated_at: string;
}

export type NotificationModulePreferencesMap = Map<
  string,
  NotificationModulePreference
>;
