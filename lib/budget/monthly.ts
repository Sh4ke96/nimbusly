import { expandBudgetEntriesForMonth } from "@/lib/budget/recurrence";
import type { BudgetExpense } from "@/lib/budget/types";

export function getCurrentMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function filterEntriesByMonth(
  entries: BudgetExpense[],
  monthKey: string
): BudgetExpense[] {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return entries;
  return expandBudgetEntriesForMonth(entries, monthKey);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return getCurrentMonthKey(date);
}

export function formatMonthKeyLabel(monthKey: string, monthNames: string[]): string {
  const [year, month] = monthKey.split("-").map(Number);
  const name = monthNames[month - 1];
  return name ? `${name} ${year}` : monthKey;
}

export function collectMonthKeysFromEntries(entries: BudgetExpense[]): string[] {
  const keys = new Set<string>();
  for (const entry of entries) {
    keys.add(entry.expense_date.slice(0, 7));
  }
  return [...keys].sort((a, b) => b.localeCompare(a));
}
