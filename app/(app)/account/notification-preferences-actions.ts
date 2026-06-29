"use server";

import { NOTIFICATION_CHANNEL, type NotificationChannel } from "@/lib/constants/notification-channels";
import {
  isNotificationModuleId,
  NOTIFICATION_MODULE_IDS,
  type NotificationModuleId,
} from "@/lib/constants/notification-modules";
import { defaultModulePreferences } from "@/lib/notifications/module-preferences/defaults";
import {
  ensureModulePreferencesForUser,
  loadAllModulePreferencesForUser,
} from "@/lib/notifications/module-preferences/load-module-preferences";
import type { NotificationModulePreference } from "@/lib/notifications/module-preferences/types";
import { requireUser } from "@/lib/server-actions/require-user";

function channelColumn(channel: NotificationChannel): string {
  switch (channel) {
    case NOTIFICATION_CHANNEL.IN_APP:
      return "in_app_enabled";
    case NOTIFICATION_CHANNEL.PUSH:
      return "push_enabled";
    case NOTIFICATION_CHANNEL.EMAIL_DIGEST:
      return "email_digest_enabled";
  }
}

export async function getModuleNotificationPreferences(): Promise<NotificationModulePreference[]> {
  const { supabase, user } = await requireUser();
  if (!user) return defaultModulePreferences();

  return ensureModulePreferencesForUser(supabase, user.id);
}

export async function updateModuleNotificationChannel(
  moduleId: NotificationModuleId,
  channel: NotificationChannel,
  enabled: boolean
): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user || !isNotificationModuleId(moduleId)) return;

  await ensureModulePreferencesForUser(supabase, user.id);

  const column = channelColumn(channel);
  await supabase
    .from("notification_module_preferences")
    .update({
      [column]: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("module_id", moduleId);
}

export async function updatePushNotificationsEnabled(enabled: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      push_notifications_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}

export async function updateEmailDigestEnabled(enabled: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      email_digest_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}

export async function listNotificationModuleIds(): Promise<NotificationModuleId[]> {
  return [...NOTIFICATION_MODULE_IDS];
}

export async function refreshModuleNotificationPreferences(): Promise<NotificationModulePreference[]> {
  const { supabase, user } = await requireUser();
  if (!user) return defaultModulePreferences();
  return loadAllModulePreferencesForUser(supabase, user.id);
}
