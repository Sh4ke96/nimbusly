"use server";

import { requireUser } from "@/lib/server-actions/require-user";

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
