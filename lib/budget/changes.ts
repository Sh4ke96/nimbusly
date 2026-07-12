import type { Budget } from "@/lib/budget/types";
import { normalizeBudgetName } from "@/lib/budget/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

export function buildBudgetChangeSummary(
  before: Pick<Budget, "name">,
  after: Pick<Budget, "name">,
  labels: Pick<Dict["budget"], "changeSummaryName" | "changeSummaryEmpty">
): string {
  if (
    normalizeBudgetName(before.name) !== normalizeBudgetName(after.name)
  ) {
    return formatMessage(labels.changeSummaryName, {
      from: before.name,
      to: after.name,
    });
  }
  return labels.changeSummaryEmpty;
}

export function formatBudgetNotificationDetail(
  budgetName: string,
  expenseCount: number,
  labels: Pick<Dict["budget"], "notificationDetailExpenses">
): string {
  return formatMessage(labels.notificationDetailExpenses, {
    name: normalizeBudgetName(budgetName),
    count: String(expenseCount),
  });
}

export function formatBudgetExpenseNotificationDetail(
  amount: number,
  categoryLabel: string,
  description: string,
  labels: Pick<Dict["budget"], "notificationDetailExpense">
): string {
  const desc = description.trim();
  const base = formatMessage(labels.notificationDetailExpense, {
    amount: amount.toFixed(2),
    category: categoryLabel,
  });
  if (!desc) return base;
  return `${base} - ${desc}`;
}
