"use server";

import { getServerT } from "@/lib/i18n/server";
import { ensureModulePreferencesForUser } from "@/lib/notifications/module-preferences/load-module-preferences";
import { isValidPushSubscriptionInput } from "@/lib/push/validate-subscription";
import { requireUser } from "@/lib/server-actions/require-user";

export type PushActionState = {
  success?: string;
  error?: string;
} | null;

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
  userAgent?: string | null
): Promise<PushActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  if (!isValidPushSubscriptionInput(subscription)) {
    return { error: t.pwa.pushError };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: userAgent ?? null,
      updated_at: now,
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) return { error: t.pwa.pushError };
  return { success: "saved" };
}

/** After browser subscribe: enable global + per-module push so alerts actually reach the device. */
export async function enablePushAfterBrowserSubscription(): Promise<PushActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      push_notifications_enabled: true,
      updated_at: now,
    })
    .eq("id", user.id);

  if (profileError) return { error: t.pwa.pushError };

  await ensureModulePreferencesForUser(supabase, user.id);

  return { success: "enabled" };
}

/** After browser unsubscribe: turn off global push flag (module prefs stay as user set them). */
export async function disablePushAfterBrowserUnsubscribe(): Promise<PushActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      push_notifications_enabled: false,
      updated_at: now,
    })
    .eq("id", user.id);

  if (profileError) return { error: t.pwa.pushError };
  return { success: "disabled" };
}

export async function removePushSubscription(endpoint?: string): Promise<PushActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  let query = supabase.from("push_subscriptions").delete().eq("user_id", user.id);
  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { error } = await query;
  if (error) return { error: t.pwa.pushError };
  return { success: "removed" };
}
