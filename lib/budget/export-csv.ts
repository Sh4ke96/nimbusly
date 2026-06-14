import { formatBudgetAmount } from "@/lib/budget/aggregates";
import { isIncomeEntry, type BudgetExpense } from "@/lib/budget/types";
import type { Lang } from "@/lib/constants/lang";
import { LOCALE_BY_LANG } from "@/lib/constants/lang";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildBudgetEntriesCsv(params: {
  budgetName: string;
  expenses: BudgetExpense[];
  lang: Lang;
  labels: {
    date: string;
    type: string;
    category: string;
    amount: string;
    description: string;
    income: string;
    expense: string;
  };
}): string {
  const header = [
    params.labels.date,
    params.labels.type,
    params.labels.category,
    params.labels.amount,
    params.labels.description,
  ]
    .map(escapeCsvCell)
    .join(",");

  const rows = params.expenses.map((entry) => {
    const typeLabel = isIncomeEntry(entry)
      ? params.labels.income
      : params.labels.expense;
    return [
      entry.expense_date,
      typeLabel,
      entry.category,
      formatBudgetAmount(Number(entry.amount), params.lang),
      entry.description ?? "",
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(",");
  });

  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function sanitizeCsvFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "export";
}

export function formatCsvDateStamp(date: Date = new Date()): string {
  return date.toLocaleDateString(LOCALE_BY_LANG.pl).replace(/\./g, "-");
}
