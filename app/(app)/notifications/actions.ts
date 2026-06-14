"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function markNotificationRead(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.notifications.errorGeneric };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: t.notifications.errorGeneric };

  return { success: t.notifications.markedRead };
}

export async function markAllNotificationsRead(
  _prev: AccountActionState
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: t.notifications.errorGeneric };

  return { success: t.notifications.allMarkedRead };
}
