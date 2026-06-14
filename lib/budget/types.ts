import {
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_INCOME_CATEGORIES,
  BUDGET_NAME_MAX_LENGTH,
  BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH,
  BUDGET_ENTRY_TYPE,
  type BudgetEntryType,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";

export interface Budget {
  id: string;
  family_id: string | null;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetMember {
  budget_id: string;
  member_id: string;
}

export interface BudgetExpense {
  id: string;
  budget_id: string;
  entry_type: BudgetEntryType;
  category: BudgetExpenseCategory | BudgetIncomeCategory;
  amount: number;
  description: string;
  expense_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type BudgetWithMembers = Budget & {
  member_ids: string[];
};

export function normalizeBudgetName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidBudgetName(name: string): boolean {
  const normalized = normalizeBudgetName(name);
  return normalized.length > 0 && normalized.length <= BUDGET_NAME_MAX_LENGTH;
}

export function isValidBudgetExpenseCategory(
  value: string
): value is BudgetExpenseCategory {
  return (BUDGET_EXPENSE_CATEGORIES as readonly string[]).includes(value);
}

export function isValidBudgetIncomeCategory(
  value: string
): value is BudgetIncomeCategory {
  return (BUDGET_INCOME_CATEGORIES as readonly string[]).includes(value);
}

export function isExpenseEntry(
  entry: Pick<BudgetExpense, "entry_type">
): boolean {
  return entry.entry_type === BUDGET_ENTRY_TYPE.EXPENSE;
}

export function isIncomeEntry(
  entry: Pick<BudgetExpense, "entry_type">
): boolean {
  return entry.entry_type === BUDGET_ENTRY_TYPE.INCOME;
}

export function parseBudgetAmount(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

export function isValidExpenseDescription(description: string): boolean {
  return description.length <= BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH;
}

export function isValidExpenseDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseBudgetMemberIdsFromForm(formData: FormData): string[] {
  const raw = formData.getAll("memberIds");
  return raw
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export function dateToExpenseDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
