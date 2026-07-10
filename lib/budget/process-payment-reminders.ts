import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { BUDGET_ENTRY_TYPE, type BudgetRecurrence } from "@/lib/constants/budget";
import { dict } from "@/lib/i18n";
import { LANG, type Lang } from "@/lib/constants/lang";
import { formatMessage } from "@/lib/i18n/format";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { formatBudgetExpenseNotificationDetail } from "@/lib/budget/changes";
import {
  buildBudgetReminderKey,
  getBudgetReminderOffsetsToSend,
  resolveBudgetReminderDueDate,
} from "@/lib/budget/reminders";
import {
  notifySystemModuleSubscribers,
  resolveBudgetReminderRecipientIds,
} from "@/lib/notifications/dispatch-system-module-notification";

const REMINDER_ACTOR = "Nimbusly";

type BudgetExpenseRow = {
  id: string;
  budget_id: string;
  entry_type: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  recurrence: BudgetRecurrence;
  recurrence_end_date: string | null;
  payment_reminder_enabled: boolean;
  reminder_sent_keys: string[];
  created_by: string;
};

type BudgetRow = { id: string; name: string; family_id: string | null; created_by: string };

function resolveLang(preferred: string | null | undefined): Lang {
  return preferred === LANG.EN ? LANG.EN : LANG.PL;
}

function formatReminderBody(
  lang: Lang,
  params: {
    budgetName: string;
    amount: number;
    categoryLabel: string;
    description: string;
    dueDate: string;
    offsetDays: number;
  }
): string {
  const t = dict[lang];
  const detail = formatBudgetExpenseNotificationDetail(
    params.amount,
    params.categoryLabel,
    params.description,
    t.budget
  );
  const whenLabel =
    params.offsetDays === 0
      ? t.budget.paymentReminderDueToday
      : formatMessage(t.budget.paymentReminderDueInDays, {
          count: String(params.offsetDays),
        });
  return `${params.budgetName}${t.notifications.notificationBodySeparator}${detail}${t.notifications.notificationBodySeparator}${whenLabel} (${params.dueDate})`;
}

function resolveCategoryLabel(
  category: string,
  lang: Lang
): string {
  const labels = dict[lang].budget;
  return (
    labels.categoryLabels[category as keyof typeof labels.categoryLabels] ??
    category
  );
}

export async function processBudgetPaymentReminders(
  supabase: SupabaseClient<Database>,
  today = new Date()
): Promise<{ sent: number; errors: string[] }> {
  const { data: expenses, error: fetchError } = await supabase
    .from("budget_expenses")
    .select("*")
    .eq("payment_reminder_enabled", true)
    .eq("entry_type", BUDGET_ENTRY_TYPE.EXPENSE);

  if (fetchError) {
    return { sent: 0, errors: [fetchError.message] };
  }

  const budgetIds = [...new Set((expenses ?? []).map((row) => row.budget_id))];
  const budgetsById = new Map<string, BudgetRow>();

  if (budgetIds.length > 0) {
    const { data: budgets } = await supabase
      .from("budgets")
      .select("id, name, family_id, created_by")
      .in("id", budgetIds);

    for (const budget of budgets ?? []) {
      budgetsById.set(budget.id, budget as BudgetRow);
    }
  }

  let sent = 0;
  const errors: string[] = [];

  for (const raw of (expenses ?? []) as BudgetExpenseRow[]) {
    const expense: BudgetExpenseRow = {
      ...raw,
      recurrence: raw.recurrence as BudgetRecurrence,
      reminder_sent_keys: raw.reminder_sent_keys ?? [],
    };
    const budget = budgetsById.get(expense.budget_id);
    if (!budget) continue;

    const dueDate = resolveBudgetReminderDueDate(expense);
    if (!dueDate) continue;

    const offsets = getBudgetReminderOffsetsToSend(
      dueDate,
      expense.reminder_sent_keys,
      today
    );
    if (offsets.length === 0) continue;

    const recipientIds = await resolveBudgetReminderRecipientIds(
      supabase,
      budget,
      expense.created_by
    );

    if (recipientIds.length === 0) continue;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, preferred_lang")
      .in("id", recipientIds);

    const langByUser = new Map(
      (profiles ?? []).map((profile) => [
        profile.id as string,
        resolveLang(profile.preferred_lang as string | null),
      ])
    );

    const newKeys = [...expense.reminder_sent_keys];

    for (const offset of offsets) {
      const key = buildBudgetReminderKey(dueDate, offset);
      if (newKeys.includes(key)) continue;

      for (const recipientId of recipientIds) {
        const lang = langByUser.get(recipientId) ?? LANG.PL;
        const t = dict[lang];
        const title = getFamilyNotificationTitle(
          NOTIFICATION_TYPE.BUDGET_EXPENSE_DUE_REMINDER,
          t.notifications,
          REMINDER_ACTOR
        );
        const body = formatReminderBody(lang, {
          budgetName: budget.name,
          amount: Number(expense.amount),
          categoryLabel: resolveCategoryLabel(expense.category, lang),
          description: expense.description ?? "",
          dueDate,
          offsetDays: offset,
        });

        await notifySystemModuleSubscribers(supabase, {
          moduleId: APP_MODULE.BUDGET,
          type: NOTIFICATION_TYPE.BUDGET_EXPENSE_DUE_REMINDER,
          title,
          body,
          payload: {
            budget_id: expense.budget_id,
            budget_name: budget.name,
            expense_id: expense.id,
            due_date: dueDate,
            offset_days: offset,
            family_id: budget.family_id,
            updated_at: new Date().toISOString(),
          },
          recipientIds: [recipientId],
        });

        sent += 1;
      }

      newKeys.push(key);
    }

    const { error: updateError } = await supabase
      .from("budget_expenses")
      .update({ reminder_sent_keys: newKeys })
      .eq("id", expense.id);

    if (updateError) {
      errors.push(`${expense.id}:update:${updateError.message}`);
    }
  }

  return { sent, errors };
}
