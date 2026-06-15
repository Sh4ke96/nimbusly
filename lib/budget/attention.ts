import { BUDGET_ENTRY_TYPE, BUDGET_PAYMENT_REMINDER_OFFSETS } from "@/lib/constants/budget";
import { daysUntilBudgetDueDate, resolveBudgetReminderDueDate } from "@/lib/budget/reminders";
import type { BudgetExpense } from "@/lib/budget/types";

const maxReminderOffset = Math.max(...BUDGET_PAYMENT_REMINDER_OFFSETS);

export function isBudgetPaymentDueSoon(
  entry: Pick<
    BudgetExpense,
    | "entry_type"
    | "expense_date"
    | "recurrence"
    | "recurrence_end_date"
    | "payment_reminder_enabled"
  >,
  today = new Date()
): boolean {
  if (entry.entry_type !== BUDGET_ENTRY_TYPE.EXPENSE) return false;
  const dueDate = resolveBudgetReminderDueDate(entry);
  if (!dueDate) return false;
  const daysUntil = daysUntilBudgetDueDate(dueDate, today);
  if (daysUntil === null || daysUntil < 0) return false;
  return daysUntil <= maxReminderOffset;
}
