"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildBudgetChangeSummary,
  formatBudgetExpenseNotificationDetail,
  formatBudgetNotificationDetail,
} from "@/lib/budget/changes";
import { excludeActorFromWatcherIds } from "@/lib/budget/watches";
import {
  isValidBudgetExpenseCategory,
  isValidBudgetIncomeCategory,
  isValidBudgetName,
  isValidExpenseDateString,
  isValidExpenseDescription,
  normalizeBudgetName,
  parseBudgetAmount,
  parseBudgetMemberIdsFromForm,
} from "@/lib/budget/types";
import { BUDGET_ENTRY_TYPE } from "@/lib/constants/budget";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function getActorProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

async function notifyFamilyAboutBudgetEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    budgetId: string;
    budgetName: string;
    bodyDetail: string;
    changeSummary?: string;
  }
) {
  const t = await getServerT();
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", params.familyId);

  const recipientIds = (members ?? [])
    .map((m) => m.id as string)
    .filter((id) => id !== params.actorId);

  if (recipientIds.length === 0) return;

  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);
  const body = `${params.budgetName}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      budget_id: params.budgetId,
      budget_name: params.budgetName,
      actor_id: params.actorId,
      family_id: params.familyId,
      change_summary: params.changeSummary ?? null,
      updated_at: new Date().toISOString(),
    },
  });
}

async function notifyWatchersAboutBudgetExpenseEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    budgetId: string;
    budgetName: string;
    familyId: string | null;
    bodyDetail: string;
    amount: number;
    category: string;
  }
) {
  const t = await getServerT();
  const { data: watches } = await supabase
    .from("budget_watches")
    .select("user_id")
    .eq("budget_id", params.budgetId);

  const recipientIds = excludeActorFromWatcherIds(
    (watches ?? []).map((watch) => watch.user_id as string),
    params.actorId
  );

  if (recipientIds.length === 0) return;

  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);
  const body = `${params.budgetName}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      budget_id: params.budgetId,
      budget_name: params.budgetName,
      actor_id: params.actorId,
      family_id: params.familyId,
      amount: params.amount,
      category: params.category,
      updated_at: new Date().toISOString(),
    },
  });
}

async function getAccessibleBudget(
  supabase: Awaited<ReturnType<typeof createClient>>,
  budgetId: string
) {
  const { data } = await supabase
    .from("budgets")
    .select("id, name, family_id, created_by")
    .eq("id", budgetId)
    .maybeSingle();
  return data;
}

function resolveBudgetCategoryLabel(
  category: string,
  entryType: string,
  labels: Awaited<ReturnType<typeof getServerT>>["budget"]
): string {
  if (entryType === BUDGET_ENTRY_TYPE.INCOME) {
    return (
      labels.incomeCategoryLabels[
        category as keyof typeof labels.incomeCategoryLabels
      ] ?? category
    );
  }
  return (
    labels.categoryLabels[category as keyof typeof labels.categoryLabels] ??
    category
  );
}

async function syncBudgetMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

  const validIds = (validMembers ?? []).map((m) => m.id as string);
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

export async function createBudget(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const name = normalizeBudgetName((formData.get("name") as string) ?? "");
  if (!isValidBudgetName(name)) return { error: t.budget.errorNameRequired };

  const profile = await getActorProfile(supabase, user.id);
  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

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
  }

  if (familyId && profile) {
    try {
      await notifyFamilyAboutBudgetEvent(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        budgetId: budget.id,
        budgetName: name,
        bodyDetail: formatBudgetNotificationDetail(name, 0, t.budget),
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.budget.createdSuccess };
}

export async function updateBudget(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const name = normalizeBudgetName((formData.get("name") as string) ?? "");
  if (!id) return { error: t.budget.errorGeneric };
  if (!isValidBudgetName(name)) return { error: t.budget.errorNameRequired };

  const existing = await getAccessibleBudget(supabase, id);
  if (!existing) return { error: t.budget.errorNotFound };

  const profile = await getActorProfile(supabase, user.id);
  const { error } = await supabase
    .from("budgets")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: t.budget.errorGeneric };

  if (existing.family_id) {
    const memberIds = parseBudgetMemberIdsFromForm(formData);
    const synced = await syncBudgetMembers(
      supabase,
      id,
      memberIds,
      existing.family_id
    );
    if (!synced && memberIds.length > 0) {
      return { error: t.budget.errorInvalidMembers };
    }
  }

  const changeSummary = buildBudgetChangeSummary(existing, { name }, t.budget);
  if (existing.family_id && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    try {
      await notifyFamilyAboutBudgetEvent(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId: existing.family_id,
        budgetId: id,
        budgetName: name,
        bodyDetail: changeSummary,
        changeSummary,
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.budget.updatedSuccess };
}

export async function deleteBudget(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.budget.errorGeneric };

  const existing = await getAccessibleBudget(supabase, id);
  if (!existing) return { error: t.budget.errorNotFound };

  const profile = await getActorProfile(supabase, user.id);
  const { count } = await supabase
    .from("budget_expenses")
    .select("id", { count: "exact", head: true })
    .eq("budget_id", id);

  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: t.budget.errorGeneric };

  if (existing.family_id && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    try {
      await notifyFamilyAboutBudgetEvent(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_DELETED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId: existing.family_id,
        budgetId: id,
        budgetName: existing.name,
        bodyDetail: formatBudgetNotificationDetail(
          existing.name,
          count ?? 0,
          t.budget
        ),
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.budget.deletedSuccess };
}

export async function toggleBudgetWatch(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const budgetId = formData.get("budgetId") as string;
  const watch = formData.get("watch") === "true";
  if (!budgetId) return { error: t.budget.errorGeneric };

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  if (watch) {
    const { error } = await supabase.from("budget_watches").insert({
      user_id: user.id,
      budget_id: budgetId,
    });
    if (error) return { error: t.budget.errorGeneric };
    return { success: t.budget.watchEnabledSuccess };
  }

  const { error } = await supabase
    .from("budget_watches")
    .delete()
    .eq("user_id", user.id)
    .eq("budget_id", budgetId);
  if (error) return { error: t.budget.errorGeneric };
  return { success: t.budget.watchDisabledSuccess };
}

export async function addBudgetExpense(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const budgetId = formData.get("budgetId") as string;
  const category = (formData.get("category") as string)?.trim() ?? "";
  const amount = parseBudgetAmount((formData.get("amount") as string) ?? "");
  const description = ((formData.get("description") as string) ?? "").trim();
  const expenseDate = (formData.get("expenseDate") as string)?.trim() ?? "";

  if (!budgetId) return { error: t.budget.errorGeneric };
  if (!isValidBudgetExpenseCategory(category)) return { error: t.budget.errorCategory };
  if (amount === null) return { error: t.budget.errorAmount };
  if (!isValidExpenseDescription(description)) return { error: t.budget.errorDescription };
  if (!isValidExpenseDateString(expenseDate)) return { error: t.budget.errorDate };

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  const { error } = await supabase.from("budget_expenses").insert({
    budget_id: budgetId,
    entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
    category,
    amount,
    description,
    expense_date: expenseDate,
    created_by: user.id,
  });

  if (error) return { error: t.budget.errorGeneric };

  await supabase
    .from("budgets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", budgetId);

  const profile = await getActorProfile(supabase, user.id);
  if (profile) {
    const categoryLabel = resolveBudgetCategoryLabel(
      category,
      BUDGET_ENTRY_TYPE.EXPENSE,
      t.budget
    );
    const bodyDetail = formatBudgetExpenseNotificationDetail(
      amount,
      categoryLabel,
      description,
      t.budget
    );
    try {
      await notifyWatchersAboutBudgetExpenseEvent(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_EXPENSE_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        budgetId,
        budgetName: budget.name,
        familyId: budget.family_id,
        bodyDetail,
        amount,
        category,
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.budget.expenseAddedSuccess };
}

export async function addBudgetIncome(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const budgetId = formData.get("budgetId") as string;
  const category = (formData.get("category") as string)?.trim() ?? "";
  const amount = parseBudgetAmount((formData.get("amount") as string) ?? "");
  const description = ((formData.get("description") as string) ?? "").trim();
  const expenseDate = (formData.get("expenseDate") as string)?.trim() ?? "";

  if (!budgetId) return { error: t.budget.errorGeneric };
  if (!isValidBudgetIncomeCategory(category)) return { error: t.budget.errorIncomeCategory };
  if (amount === null) return { error: t.budget.errorAmount };
  if (!isValidExpenseDescription(description)) return { error: t.budget.errorDescription };
  if (!isValidExpenseDateString(expenseDate)) return { error: t.budget.errorDate };

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  const { error } = await supabase.from("budget_expenses").insert({
    budget_id: budgetId,
    entry_type: BUDGET_ENTRY_TYPE.INCOME,
    category,
    amount,
    description,
    expense_date: expenseDate,
    created_by: user.id,
  });

  if (error) return { error: t.budget.errorGeneric };

  await supabase
    .from("budgets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", budgetId);

  const profile = await getActorProfile(supabase, user.id);
  if (profile) {
    const categoryLabel = resolveBudgetCategoryLabel(
      category,
      BUDGET_ENTRY_TYPE.INCOME,
      t.budget
    );
    const bodyDetail = formatBudgetExpenseNotificationDetail(
      amount,
      categoryLabel,
      description,
      t.budget
    );
    try {
      await notifyWatchersAboutBudgetExpenseEvent(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_INCOME_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        budgetId,
        budgetName: budget.name,
        familyId: budget.family_id,
        bodyDetail,
        amount,
        category,
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.budget.incomeAddedSuccess };
}

export async function deleteBudgetExpense(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const budgetId = formData.get("budgetId") as string;
  if (!id || !budgetId) return { error: t.budget.errorGeneric };

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  const { data: existing } = await supabase
    .from("budget_expenses")
    .select("category, amount, description, entry_type")
    .eq("id", id)
    .eq("budget_id", budgetId)
    .maybeSingle();

  const { error } = await supabase
    .from("budget_expenses")
    .delete()
    .eq("id", id)
    .eq("budget_id", budgetId);

  if (error) return { error: t.budget.errorGeneric };

  await supabase
    .from("budgets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", budgetId);

  if (existing) {
    const profile = await getActorProfile(supabase, user.id);
    if (profile) {
      const entryType = existing.entry_type ?? BUDGET_ENTRY_TYPE.EXPENSE;
      const categoryLabel = resolveBudgetCategoryLabel(
        existing.category as string,
        entryType,
        t.budget
      );
      const bodyDetail = formatBudgetExpenseNotificationDetail(
        Number(existing.amount),
        categoryLabel,
        existing.description ?? "",
        t.budget
      );
      const notificationType =
        entryType === BUDGET_ENTRY_TYPE.INCOME
          ? NOTIFICATION_TYPE.BUDGET_INCOME_REMOVED
          : NOTIFICATION_TYPE.BUDGET_EXPENSE_REMOVED;
      try {
        await notifyWatchersAboutBudgetExpenseEvent(supabase, {
          type: notificationType,
          actorId: user.id,
          actorName: getDisplayName(profile),
          budgetId,
          budgetName: budget.name,
          familyId: budget.family_id,
          bodyDetail,
          amount: Number(existing.amount),
          category: existing.category as string,
        });
      } catch {
        // best-effort
      }
    }
  }

  const successMessage =
    existing?.entry_type === BUDGET_ENTRY_TYPE.INCOME
      ? t.budget.incomeDeletedSuccess
      : t.budget.expenseDeletedSuccess;

  return { success: successMessage };
}
