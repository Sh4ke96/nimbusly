"use server";

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
  const { supabase, user } = await requireUser();
  if (!user) return { error: "unauthorized" };

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

  if (error) return { error: error.message };
  return { success: "saved" };
}

export async function removePushSubscription(endpoint?: string): Promise<PushActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "unauthorized" };

  let query = supabase.from("push_subscriptions").delete().eq("user_id", user.id);
  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { error } = await query;
  if (error) return { error: error.message };
  return { success: "removed" };
}
