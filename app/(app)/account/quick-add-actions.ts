"use server";

import { getServerT } from "@/lib/i18n/server";
import { requireUser } from "@/lib/server-actions/require-user";

export type QuickAddSettingActionState = { error: string } | { success: true } | null;

export async function updateQuickAddEnabled(
  enabled: boolean
): Promise<QuickAddSettingActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      quick_add_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("quick_add_enabled")
    .maybeSingle();

  if (error) {
    console.error("[profile] quick_add_enabled update failed", error.message);
    return { error: t.search.settingSaveError };
  }

  if (!data || data.quick_add_enabled !== enabled) {
    console.error("[profile] quick_add_enabled update did not persist", {
      expected: enabled,
      actual: data?.quick_add_enabled,
    });
    return { error: t.search.settingSaveError };
  }

  return { success: true };
}
