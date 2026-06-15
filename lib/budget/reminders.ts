import {
  BUDGET_PAYMENT_REMINDER_OFFSETS,
  type BudgetPaymentReminderOffset,
} from "@/lib/constants/budget";
import { parseBudgetDateString, getNextBudgetDueDate } from "@/lib/budget/recurrence";
import type { BudgetRecurrence } from "@/lib/constants/budget";

export function buildBudgetReminderKey(dueDate: string, offsetDays: number): string {
  return `${dueDate}:${offsetDays}`;
}

export function daysUntilBudgetDueDate(dueDate: string, today = new Date()): number | null {
  const due = parseBudgetDateString(dueDate);
  if (!due) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = due.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getBudgetReminderOffsetsToSend(
  dueDate: string,
  sentKeys: string[],
  today = new Date()
): BudgetPaymentReminderOffset[] {
  const daysUntil = daysUntilBudgetDueDate(dueDate, today);
  if (daysUntil === null || daysUntil < 0) return [];

  return BUDGET_PAYMENT_REMINDER_OFFSETS.filter((offset) => {
    if (daysUntil !== offset) return false;
    return !sentKeys.includes(buildBudgetReminderKey(dueDate, offset));
  });
}

export function resolveBudgetReminderDueDate(entry: {
  expense_date: string;
  recurrence: BudgetRecurrence;
  recurrence_end_date: string | null;
  payment_reminder_enabled: boolean;
}): string | null {
  if (!entry.payment_reminder_enabled) return null;
  return getNextBudgetDueDate(entry);
}
