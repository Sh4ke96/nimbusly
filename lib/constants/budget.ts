export const BUDGET_NAME_MAX_LENGTH = 200;
export const BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH = 500;
export const BUDGET_FILTER_ALL = "all" as const;

export const BUDGET_ENTRY_TYPE = {
  EXPENSE: "expense",
  INCOME: "income",
} as const;

export type BudgetEntryType =
  (typeof BUDGET_ENTRY_TYPE)[keyof typeof BUDGET_ENTRY_TYPE];

export const BUDGET_EXPENSE_CATEGORY = {
  WORK: "work",
  BILLS: "bills",
  SPORT: "sport",
  INSTALLMENTS: "installments",
  CAR: "car",
  SHOPPING: "shopping",
  SUBSCRIPTIONS: "subscriptions",
  OTHER: "other",
} as const;

export const BUDGET_EXPENSE_CATEGORIES = [
  BUDGET_EXPENSE_CATEGORY.WORK,
  BUDGET_EXPENSE_CATEGORY.BILLS,
  BUDGET_EXPENSE_CATEGORY.SPORT,
  BUDGET_EXPENSE_CATEGORY.INSTALLMENTS,
  BUDGET_EXPENSE_CATEGORY.CAR,
  BUDGET_EXPENSE_CATEGORY.SHOPPING,
  BUDGET_EXPENSE_CATEGORY.SUBSCRIPTIONS,
  BUDGET_EXPENSE_CATEGORY.OTHER,
] as const;

export type BudgetExpenseCategory =
  (typeof BUDGET_EXPENSE_CATEGORIES)[number];

export const BUDGET_INCOME_CATEGORY = {
  SALARY: "salary",
  FREELANCE: "freelance",
  INVESTMENT: "investment",
  OTHER_INCOME: "other_income",
} as const;

export const BUDGET_INCOME_CATEGORIES = [
  BUDGET_INCOME_CATEGORY.SALARY,
  BUDGET_INCOME_CATEGORY.FREELANCE,
  BUDGET_INCOME_CATEGORY.INVESTMENT,
  BUDGET_INCOME_CATEGORY.OTHER_INCOME,
] as const;

export type BudgetIncomeCategory =
  (typeof BUDGET_INCOME_CATEGORIES)[number];

export type BudgetCategory = BudgetExpenseCategory | BudgetIncomeCategory;

export const BUDGET_CATEGORY_COLORS: Record<BudgetCategory, string> = {
  work: "#618764",
  bills: "#4a6fa5",
  sport: "#c45c26",
  installments: "#7c5cbf",
  car: "#3d8b8b",
  shopping: "#b8860b",
  subscriptions: "#9b59b6",
  other: "#6b7280",
  salary: "#2e7d4f",
  freelance: "#3d7ea6",
  investment: "#b08d28",
  other_income: "#5c6b7a",
};

export const BUDGET_INCOME_COLOR = "#2e7d4f";
export const BUDGET_EXPENSE_COLOR = "#c45c26";
