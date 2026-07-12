import {
  isNotificationModuleId,
  type NotificationModuleId,
} from "@/lib/constants/notification-modules";
import { defaultModulePreference, defaultModulePreferences } from "@/lib/notifications/module-preferences/defaults";
import type {
  NotificationModulePreference,
  NotificationModulePreferenceRow,
  NotificationModulePreferencesMap,
} from "@/lib/notifications/module-preferences/types";
import type { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export function mapPreferenceRow(
  row: NotificationModulePreferenceRow
): NotificationModulePreference | null {
  if (!isNotificationModuleId(row.module_id)) return null;
  return {
    moduleId: row.module_id,
    inAppEnabled: row.in_app_enabled,
    pushEnabled: row.push_enabled,
    emailDigestEnabled: row.email_digest_enabled,
  };
}

export async function loadModulePreferencesForUsers(
  supabase: SupabaseClient,
  userIds: string[],
  moduleId: NotificationModuleId
): Promise<NotificationModulePreferencesMap> {
  const map: NotificationModulePreferencesMap = new Map();
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return map;

  const defaults = defaultModulePreference(moduleId);
  for (const userId of uniqueIds) {
    map.set(userId, { ...defaults });
  }

  const { data, error } = await supabase
    .from("notification_module_preferences")
    .select("user_id, module_id, in_app_enabled, push_enabled, email_digest_enabled, updated_at")
    .in("user_id", uniqueIds)
    .eq("module_id", moduleId);

  if (error) {
    console.error("[notifications] load module preferences failed", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const pref = mapPreferenceRow(row as NotificationModulePreferenceRow);
    if (pref) {
      map.set(row.user_id, pref);
    }
  }

  return map;
}

/** Notification dispatch - read other users' prefs (RLS blocks the actor's session client). */
export async function loadRecipientModulePreferences(
  userIds: string[],
  moduleId: NotificationModuleId
): Promise<NotificationModulePreferencesMap> {
  const supabase = createServiceRoleClient();
  return loadModulePreferencesForUsers(supabase, userIds, moduleId);
}

export async function loadAllModulePreferencesForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<NotificationModulePreference[]> {
  const { data, error } = await supabase
    .from("notification_module_preferences")
    .select("user_id, module_id, in_app_enabled, push_enabled, email_digest_enabled, updated_at")
    .eq("user_id", userId);

  if (error) {
    console.error("[notifications] load all module preferences failed", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => mapPreferenceRow(row as NotificationModulePreferenceRow))
    .filter((pref): pref is NotificationModulePreference => pref !== null);
}

export async function ensureModulePreferencesForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<NotificationModulePreference[]> {
  const existing = await loadAllModulePreferencesForUser(supabase, userId);
  if (existing.length >= 11) return existing;

  const rows = defaultModulePreferences().map((pref) => ({
    user_id: userId,
    module_id: pref.moduleId,
    in_app_enabled: pref.inAppEnabled,
    push_enabled: pref.pushEnabled,
    email_digest_enabled: pref.emailDigestEnabled,
  }));

  await supabase
    .from("notification_module_preferences")
    .upsert(rows, { onConflict: "user_id,module_id", ignoreDuplicates: true });

  return loadAllModulePreferencesForUser(supabase, userId);
}
