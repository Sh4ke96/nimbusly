import { parseEntityIdFromForm } from "@/lib/form/common-fields";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type NotificationReadContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
};

export async function executeMarkNotificationRead(
  { t, user, supabase }: NotificationReadContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseEntityIdFromForm(formData);
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

export async function executeMarkAllNotificationsRead({
  t,
  user,
  supabase,
}: NotificationReadContext): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: t.notifications.errorGeneric };

  return { success: t.notifications.allMarkedRead };
}
