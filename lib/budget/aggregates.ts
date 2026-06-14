import {
  BUDGET_ENTRY_TYPE,
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_FILTER_ALL,
  BUDGET_INCOME_CATEGORIES,
  type BudgetCategory,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import { isExpenseEntry, isIncomeEntry, type BudgetExpense } from "@/lib/budget/types";

export interface CategoryTotal {
  category: BudgetCategory;
  total: number;
  count: number;
}

export function sumAmounts(entries: Pick<BudgetExpense, "amount">[]): number {
  return entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

/** @deprecated use sumAmounts */
export const sumExpenses = sumAmounts;

export function sumExpensesOnly(entries: BudgetExpense[]): number {
  return sumAmounts(entries.filter(isExpenseEntry));
}

export function sumIncomeOnly(entries: BudgetExpense[]): number {
  return sumAmounts(entries.filter(isIncomeEntry));
}

export function netBalance(entries: BudgetExpense[]): number {
  return sumIncomeOnly(entries) - sumExpensesOnly(entries);
}

export function filterByEntryType(
  entries: BudgetExpense[],
  typeFilter: string
): BudgetExpense[] {
  if (typeFilter === BUDGET_FILTER_ALL) return entries;
  if (typeFilter === BUDGET_ENTRY_TYPE.INCOME) {
    return entries.filter(isIncomeEntry);
  }
  if (typeFilter === BUDGET_ENTRY_TYPE.EXPENSE) {
    return entries.filter(isExpenseEntry);
  }
  return entries;
}

export function aggregateByCategory(
  entries: BudgetExpense[],
  categories: readonly BudgetCategory[]
): CategoryTotal[] {
  const totals = new Map<BudgetCategory, CategoryTotal>();

  for (const category of categories) {
    totals.set(category, { category, total: 0, count: 0 });
  }

  for (const entry of entries) {
    const row = totals.get(entry.category as BudgetCategory);
    if (!row) continue;
    row.total += Number(entry.amount);
    row.count += 1;
  }

  return categories.map(
    (category) => totals.get(category) ?? { category, total: 0, count: 0 }
  );
}

export function aggregateExpensesByCategory(
  entries: BudgetExpense[]
): CategoryTotal[] {
  return aggregateByCategory(
    entries.filter(isExpenseEntry),
    BUDGET_EXPENSE_CATEGORIES
  );
}

export function aggregateIncomeByCategory(
  entries: BudgetExpense[]
): CategoryTotal[] {
  return aggregateByCategory(
    entries.filter(isIncomeEntry),
    BUDGET_INCOME_CATEGORIES
  );
}

export function filterEntriesByCategory(
  entries: BudgetExpense[],
  categoryKey: string
): BudgetExpense[] {
  if (categoryKey === BUDGET_FILTER_ALL) return entries;
  return entries.filter((entry) => entry.category === categoryKey);
}

/** @deprecated use filterEntriesByCategory */
export const filterExpensesByCategory = filterEntriesByCategory;

export function formatBudgetAmount(
  amount: number,
  locale: string,
  currency = "PLN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export type { BudgetExpenseCategory, BudgetIncomeCategory };
