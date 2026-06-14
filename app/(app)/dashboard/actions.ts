"use server";

import { getServerT } from "@/lib/i18n/server";
import { parseDashboardLayoutFromForm } from "@/lib/dashboard/form";
import {
  parseDashboardOverviewLayout,
  serializeDashboardOverviewLayout,
  type DashboardOverviewLayout,
} from "@/lib/dashboard/overview-layout";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser } from "@/lib/server-actions/require-user";

export async function updateDashboardOverviewLayout(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const layoutRaw = parseDashboardLayoutFromForm(formData);
  if (!layoutRaw) return { error: t.dashboard.errorOverviewLayoutInvalid };

  let layout: DashboardOverviewLayout;
  try {
    layout = parseDashboardOverviewLayout(JSON.parse(layoutRaw));
  } catch {
    return { error: t.dashboard.errorOverviewLayoutInvalid };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      dashboard_overview_layout: JSON.parse(serializeDashboardOverviewLayout(layout)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: t.dashboard.errorOverviewLayoutSave };

  return { success: t.dashboard.overviewLayoutSaved };
}
