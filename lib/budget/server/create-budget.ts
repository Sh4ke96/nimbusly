import {
  formatBudgetNotificationDetail,
} from "@/lib/budget/changes";
import {
  isValidBudgetName,
  normalizeBudgetName,
  parseBudgetMemberIdsFromForm,
  parseBudgetNameFromForm,
} from "@/lib/budget/types";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import { getProfileFamilyContext } from "@/lib/server-actions/require-user";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { resolveBudgetNotificationRecipients } from "@/lib/family/assignee-visibility";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type NotifyFamilyMembers = (
  supabase: AppSupabase,
  params: {
    type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
    actorId: string;
    actorName: string;
    familyId: string;
    body: string;
    payload: Record<string, unknown>;
    onlyRecipientIds?: string[];
  }
) => Promise<void>;

export type CreateBudgetContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  notifyFamilyMembers?: NotifyFamilyMembers;
};

async function syncBudgetMembers(
  supabase: AppSupabase,
  budgetId: string,
  memberIds: string[],
  familyId: string
) {
  const uniqueIds = [...new Set(memberIds)];
  if (uniqueIds.length === 0) return true;

  const { data: validMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", familyId)
    .in("id", uniqueIds);

  const validIds = (validMembers ?? []).map((m) => m.id);
  if (validIds.length === 0) return false;

  await supabase.from("budget_members").delete().eq("budget_id", budgetId);

  const { error } = await supabase.from("budget_members").insert(
    validIds.map((memberId) => ({
      budget_id: budgetId,
      member_id: memberId,
    }))
  );

  return !error;
}

export async function executeCreateBudget(
  { t, user, supabase, notifyFamilyMembers }: CreateBudgetContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const name = normalizeBudgetName(parseBudgetNameFromForm(formData).name);
  if (!isValidBudgetName(name)) return { error: t.budget.errorNameRequired };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  const { data: budget, error } = await supabase
    .from("budgets")
    .insert({
      family_id: familyId,
      name,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !budget) return { error: t.budget.errorGeneric };

  if (familyId) {
    const memberIds = parseBudgetMemberIdsFromForm(formData);
    const synced = await syncBudgetMembers(supabase, budget.id, memberIds, familyId);
    if (!synced && memberIds.length > 0) {
      return { error: t.budget.errorInvalidMembers };
    }

    if (profile && notifyFamilyMembers) {
      try {
        await notifyFamilyMembers(supabase, {
          type: NOTIFICATION_TYPE.BUDGET_ADDED,
          actorId: user.id,
          actorName: getDisplayName(profile),
          familyId,
          body: `${name}${t.notifications.notificationBodySeparator}${formatBudgetNotificationDetail(name, 0, t.budget)}`,
          payload: {
            budget_id: budget.id,
            budget_name: name,
            actor_id: user.id,
            family_id: familyId,
            change_summary: null,
            updated_at: new Date().toISOString(),
          },
          onlyRecipientIds: resolveBudgetNotificationRecipients(memberIds),
        });
      } catch {
        // best-effort
      }
    }
  }

  return { success: t.budget.createdSuccess };
}
