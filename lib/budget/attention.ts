import {
  BUDGET_ENTRY_TYPE,
  BUDGET_PAYMENT_REMINDER_OFFSETS,
  BUDGET_RECURRENCE,
} from "@/lib/constants/budget";
import {
  daysUntilBudgetDueDate,
  resolveBudgetReminderDueDate,
} from "@/lib/budget/reminders";
import { parseBudgetDateString } from "@/lib/budget/recurrence";
import type { BudgetExpense } from "@/lib/budget/types";

const maxReminderOffset = Math.max(...BUDGET_PAYMENT_REMINDER_OFFSETS);

type BudgetPaymentAttentionEntry = Pick<
  BudgetExpense,
  | "entry_type"
  | "expense_date"
  | "recurrence"
  | "recurrence_end_date"
  | "payment_reminder_enabled"
>;

function resolveBudgetAttentionDueDate(
  entry: BudgetPaymentAttentionEntry,
  today = new Date()
): string | null {
  if (!entry.payment_reminder_enabled) return null;
  if (entry.entry_type !== BUDGET_ENTRY_TYPE.EXPENSE) return null;

  const upcoming = resolveBudgetReminderDueDate(entry, today);
  if (upcoming) return upcoming;

  if (entry.recurrence !== BUDGET_RECURRENCE.NONE) return null;

  const due = parseBudgetDateString(entry.expense_date);
  if (!due) return null;

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (due < todayDate) return entry.expense_date;

  return null;
}

export function isBudgetPaymentDueSoon(
  entry: BudgetPaymentAttentionEntry,
  today = new Date()
): boolean {
  const dueDate = resolveBudgetAttentionDueDate(entry, today);
  if (!dueDate) return false;

  const daysUntil = daysUntilBudgetDueDate(dueDate, today);
  if (daysUntil === null) return false;
  if (daysUntil < 0) return true;
  return daysUntil <= maxReminderOffset;
}
