"use server";

import { getServerT } from "@/lib/i18n/server";
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
