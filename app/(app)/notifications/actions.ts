"use server";

import { getServerT } from "@/lib/i18n/server";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormTrimmedString } from "@/lib/form/values";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser } from "@/lib/server-actions/require-user";
import {
  executeMarkAllNotificationsRead,
  executeMarkNotificationRead,
} from "@/lib/notifications/server/mark-notification-read";

export async function markNotificationRead(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  return executeMarkNotificationRead({ t, user, supabase }, formData);
}

export async function markAllNotificationsRead(
  _previous: AccountActionState
): Promise<AccountActionState> {
  void _previous;
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  return executeMarkAllNotificationsRead({ t, user, supabase });
}

export async function dismissNotification(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = getFormTrimmedString(formData, COMMON_FORM_FIELD.ID);
  if (!id) return { error: t.notifications.errorGeneric };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: t.notifications.errorGeneric };
  return { success: t.notifications.dismissedSuccess };
}
