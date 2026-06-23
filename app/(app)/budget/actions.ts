"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildBudgetChangeSummary,
  formatBudgetExpenseNotificationDetail,
  formatBudgetNotificationDetail,
} from "@/lib/budget/changes";
import {
  isValidBudgetExpenseCategory,
  isValidBudgetIncomeCategory,
  isValidBudgetName,
  isValidExpenseDateString,
  isValidExpenseDescription,
  normalizeBudgetName,
  parseBudgetExpenseFromForm,
  parseBudgetExpenseUpdateFromForm,
  parseBudgetHiddenFromForm,
  parseBudgetIdFromForm,
  parseBudgetMemberIdsFromForm,
  parseBudgetNameFromForm,
  parseBudgetRecurrenceFromForm,
  parseBudgetWatchFromForm,
} from "@/lib/budget/types";
import { isValidBudgetRecurrence } from "@/lib/budget/recurrence";
import { BUDGET_ENTRY_TYPE } from "@/lib/constants/budget";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyEntityWatchers } from "@/lib/server-actions/notify-watchers";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { executeCreateBudget } from "@/lib/budget/server/create-budget";

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
  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);
  const body = `${params.budgetName}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await notifyEntityWatchers(supabase, {
    watchTable: "budget_watches",
    entityColumn: "budget_id",
    entityId: params.budgetId,
    actorId: params.actorId,
    type: params.type,
    title,
    body,
    payload: {
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

function parseBudgetEntryRecurrence(
  formData: FormData,
  expenseDate: string,
  allowPaymentReminder: boolean
):
  | {
      recurrence: string;
      recurrence_end_date: string | null;
      payment_reminder_enabled: boolean;
    }
  | { error: "recurrence" | "date" | "recurrenceEnd" } {
  const { recurrence, recurrenceEndDate, paymentReminderEnabled } =
    parseBudgetRecurrenceFromForm(formData);

  if (!isValidBudgetRecurrence(recurrence)) {
    return { error: "recurrence" };
  }

  if (recurrenceEndDate) {
    if (!isValidExpenseDateString(recurrenceEndDate)) {
      return { error: "date" };
    }
    if (recurrenceEndDate < expenseDate) {
      return { error: "recurrenceEnd" };
    }
  }

  return {
    recurrence,
    recurrence_end_date: recurrenceEndDate || null,
    payment_reminder_enabled: allowPaymentReminder && paymentReminderEnabled,
  };
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
  return executeCreateBudget(
    { t, user, supabase, notifyFamilyMembers },
    formData
  );
}

export async function updateBudget(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseBudgetIdFromForm(formData);
  const name = normalizeBudgetName(parseBudgetNameFromForm(formData).name);
  if (!id) return { error: t.budget.errorGeneric };
  if (!isValidBudgetName(name)) return { error: t.budget.errorNameRequired };

  const existing = await getAccessibleBudget(supabase, id);
  if (!existing) return { error: t.budget.errorNotFound };

  const isHidden = parseBudgetHiddenFromForm(formData);
  const { profile } = await getProfileFamilyContext(supabase, user.id);
  const { error } = await supabase
    .from("budgets")
    .update({
      name,
      is_hidden: isHidden,
      updated_at: new Date().toISOString(),
    })
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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId: existing.family_id,
        body: `${name}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          budget_id: id,
          budget_name: name,
          actor_id: user.id,
          family_id: existing.family_id,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
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

  const id = parseBudgetIdFromForm(formData);
  if (!id) return { error: t.budget.errorGeneric };

  const existing = await getAccessibleBudget(supabase, id);
  if (!existing) return { error: t.budget.errorNotFound };

  const { profile } = await getProfileFamilyContext(supabase, user.id);
  const { count } = await supabase
    .from("budget_expenses")
    .select("id", { count: "exact", head: true })
    .eq("budget_id", id);

  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: t.budget.errorGeneric };

  if (existing.family_id && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BUDGET_DELETED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId: existing.family_id,
        body: `${existing.name}${t.notifications.notificationBodySeparator}${formatBudgetNotificationDetail(
          existing.name,
          count ?? 0,
          t.budget
        )}`,
        payload: {
          budget_id: id,
          budget_name: existing.name,
          actor_id: user.id,
          family_id: existing.family_id,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
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

  const { budgetId, watch } = parseBudgetWatchFromForm(formData);
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

  const { budgetId, category, amount, description, expenseDate } =
    parseBudgetExpenseFromForm(formData);

  if (!budgetId) return { error: t.budget.errorGeneric };
  if (!isValidBudgetExpenseCategory(category)) return { error: t.budget.errorCategory };
  if (amount === null) return { error: t.budget.errorAmount };
  if (!isValidExpenseDescription(description)) return { error: t.budget.errorDescription };
  if (!isValidExpenseDateString(expenseDate)) return { error: t.budget.errorDate };

  const recurrenceFields = parseBudgetEntryRecurrence(formData, expenseDate, true);
  if ("error" in recurrenceFields) {
    if (recurrenceFields.error === "recurrence") return { error: t.budget.errorRecurrence };
    if (recurrenceFields.error === "recurrenceEnd") {
      return { error: t.budget.errorRecurrenceEndBeforeStart };
    }
    return { error: t.budget.errorDate };
  }

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  const { error } = await supabase.from("budget_expenses").insert({
    budget_id: budgetId,
    entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
    category,
    amount,
    description,
    expense_date: expenseDate,
    recurrence: recurrenceFields.recurrence,
    recurrence_end_date: recurrenceFields.recurrence_end_date,
    payment_reminder_enabled: recurrenceFields.payment_reminder_enabled,
    reminder_sent_keys: [],
    created_by: user.id,
  });

  if (error) return { error: t.budget.errorGeneric };

  await supabase
    .from("budgets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", budgetId);

  const { profile } = await getProfileFamilyContext(supabase, user.id);
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

  const { budgetId, category, amount, description, expenseDate } =
    parseBudgetExpenseFromForm(formData);

  if (!budgetId) return { error: t.budget.errorGeneric };
  if (!isValidBudgetIncomeCategory(category)) return { error: t.budget.errorIncomeCategory };
  if (amount === null) return { error: t.budget.errorAmount };
  if (!isValidExpenseDescription(description)) return { error: t.budget.errorDescription };
  if (!isValidExpenseDateString(expenseDate)) return { error: t.budget.errorDate };

  const recurrenceFields = parseBudgetEntryRecurrence(formData, expenseDate, false);
  if ("error" in recurrenceFields) {
    if (recurrenceFields.error === "recurrence") return { error: t.budget.errorRecurrence };
    if (recurrenceFields.error === "recurrenceEnd") {
      return { error: t.budget.errorRecurrenceEndBeforeStart };
    }
    return { error: t.budget.errorDate };
  }

  const budget = await getAccessibleBudget(supabase, budgetId);
  if (!budget) return { error: t.budget.errorNotFound };

  const { error } = await supabase.from("budget_expenses").insert({
    budget_id: budgetId,
    entry_type: BUDGET_ENTRY_TYPE.INCOME,
    category,
    amount,
    description,
    expense_date: expenseDate,
    recurrence: recurrenceFields.recurrence,
    recurrence_end_date: recurrenceFields.recurrence_end_date,
    payment_reminder_enabled: false,
    reminder_sent_keys: [],
    created_by: user.id,
  });

  if (error) return { error: t.budget.errorGeneric };

  await supabase
    .from("budgets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", budgetId);

  const { profile } = await getProfileFamilyContext(supabase, user.id);
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

  const { id, budgetId } = parseBudgetExpenseUpdateFromForm(formData);
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
    const { profile } = await getProfileFamilyContext(supabase, user.id);
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
