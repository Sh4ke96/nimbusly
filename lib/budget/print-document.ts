import { BRAND_COLOR } from "@/lib/constants/brand";
import {
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_INCOME_CATEGORIES,
  type BudgetCategory,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import {
  aggregateExpensesByCategory,
  aggregateIncomeByCategory,
  formatBudgetAmount,
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { isIncomeEntry, type BudgetExpense } from "@/lib/budget/types";
import { openPrintWindow } from "@/lib/print/open-print-window";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type BudgetPrintLabels = {
  title: string;
  subtitle: string;
  generatedAt: string;
  incomeLabel: string;
  expensesLabel: string;
  balanceLabel: string;
  totalLabel: string;
  categoryLabel: string;
  amountLabel: string;
  dateLabel: string;
  descriptionLabel: string;
  typeLabel: string;
  categoryLabels: Record<BudgetExpenseCategory, string>;
  incomeCategoryLabels: Record<BudgetIncomeCategory, string>;
  entryTypeLabels: Record<"income" | "expense", string>;
  memberLabel: string;
  membersValue: string;
  noEntries: string;
  entriesHeading: string;
};

function resolveCategoryLabel(
  entry: BudgetExpense,
  labels: BudgetPrintLabels
): string {
  if (isIncomeEntry(entry)) {
    return labels.incomeCategoryLabels[entry.category as BudgetIncomeCategory];
  }
  return labels.categoryLabels[entry.category as BudgetExpenseCategory];
}

export function buildBudgetPrintHtml({
  budgetName,
  memberNames,
  entries,
  labels,
  lang,
}: {
  budgetName: string;
  memberNames: string[];
  entries: BudgetExpense[];
  labels: BudgetPrintLabels;
  lang: string;
}): string {
  const incomeTotal = sumIncomeOnly(entries);
  const expenseTotal = sumExpensesOnly(entries);
  const balance = netBalance(entries);

  const expenseByCategory = aggregateExpensesByCategory(entries).filter(
    (row) => row.count > 0
  );
  const incomeByCategory = aggregateIncomeByCategory(entries).filter(
    (row) => row.count > 0
  );

  const categoryRows = [
    ...incomeByCategory.map(
      (row) => `<tr>
        <td>${escapeHtml(labels.incomeCategoryLabels[row.category as BudgetIncomeCategory])}</td>
        <td>${escapeHtml(labels.entryTypeLabels.income)}</td>
        <td class="num">${escapeHtml(formatBudgetAmount(row.total, lang))}</td>
        <td class="num">${row.count}</td>
      </tr>`
    ),
    ...expenseByCategory.map(
      (row) => `<tr>
        <td>${escapeHtml(labels.categoryLabels[row.category as BudgetExpenseCategory])}</td>
        <td>${escapeHtml(labels.entryTypeLabels.expense)}</td>
        <td class="num">${escapeHtml(formatBudgetAmount(row.total, lang))}</td>
        <td class="num">${row.count}</td>
      </tr>`
    ),
  ].join("");

  const entryRows =
    entries.length === 0
      ? `<tr><td colspan="5" class="empty">${escapeHtml(labels.noEntries)}</td></tr>`
      : entries
          .map(
            (entry) => `<tr>
              <td>${escapeHtml(entry.expense_date)}</td>
              <td>${escapeHtml(
                isIncomeEntry(entry)
                  ? labels.entryTypeLabels.income
                  : labels.entryTypeLabels.expense
              )}</td>
              <td>${escapeHtml(resolveCategoryLabel(entry, labels))}</td>
              <td>${escapeHtml(entry.description.trim() || "—")}</td>
              <td class="num">${escapeHtml(formatBudgetAmount(Number(entry.amount), lang))}</td>
            </tr>`
          )
          .join("");

  const membersText = memberNames.length > 0 ? memberNames.join(", ") : "—";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8" />
  <title>&#8203;</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      padding: 14mm;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: ${BRAND_COLOR.FOREGROUND};
    }
    .page { max-width: 182mm; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 4px; color: ${BRAND_COLOR.PRIMARY_DARK}; }
    .subtitle { font-size: 13px; color: ${BRAND_COLOR.MUTED_FG}; margin-bottom: 16px; }
    .meta { font-size: 12px; margin-bottom: 20px; }
    .meta p { margin: 4px 0; }
    .summary { font-size: 14px; margin: 16px 0; }
    .summary p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    th, td { border: 1px solid #c5cfc0; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: ${BRAND_COLOR.PRIMARY_MUTED}; font-weight: 600; }
    td.num, th.num { text-align: right; }
    td.empty { text-align: center; color: ${BRAND_COLOR.MUTED_FG}; }
    h2 { font-size: 14px; margin: 0 0 8px; color: ${BRAND_COLOR.PRIMARY_DARK}; }
  </style>
</head>
<body>
  <div class="page">
  <h1>${escapeHtml(budgetName)}</h1>
  <p class="subtitle">${escapeHtml(labels.subtitle)}</p>
  <div class="meta">
    <p><strong>${escapeHtml(labels.memberLabel)}:</strong> ${escapeHtml(membersText)}</p>
    <p><strong>${escapeHtml(labels.generatedAt)}:</strong> ${escapeHtml(new Date().toLocaleString(lang))}</p>
  </div>
  <div class="summary">
    <p><strong>${escapeHtml(labels.incomeLabel)}:</strong> ${escapeHtml(formatBudgetAmount(incomeTotal, lang))}</p>
    <p><strong>${escapeHtml(labels.expensesLabel)}:</strong> ${escapeHtml(formatBudgetAmount(expenseTotal, lang))}</p>
    <p><strong>${escapeHtml(labels.balanceLabel)}:</strong> ${escapeHtml(formatBudgetAmount(balance, lang))}</p>
  </div>

  <h2>${escapeHtml(labels.categoryLabel)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(labels.categoryLabel)}</th>
        <th>${escapeHtml(labels.typeLabel)}</th>
        <th class="num">${escapeHtml(labels.amountLabel)}</th>
        <th class="num">#</th>
      </tr>
    </thead>
    <tbody>${categoryRows || `<tr><td colspan="4" class="empty">${escapeHtml(labels.noEntries)}</td></tr>`}</tbody>
  </table>

  <h2>${escapeHtml(labels.entriesHeading)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(labels.dateLabel)}</th>
        <th>${escapeHtml(labels.typeLabel)}</th>
        <th>${escapeHtml(labels.categoryLabel)}</th>
        <th>${escapeHtml(labels.descriptionLabel)}</th>
        <th class="num">${escapeHtml(labels.amountLabel)}</th>
      </tr>
    </thead>
    <tbody>${entryRows}</tbody>
  </table>
  </div>
</body>
</html>`;
}

export function openBudgetPrintWindow(html: string): boolean {
  return openPrintWindow(html);
}

export function getCategoryLabel(
  category: BudgetExpenseCategory,
  labels: Record<BudgetExpenseCategory, string>
): string {
  return labels[category];
}

export { BUDGET_EXPENSE_CATEGORIES, BUDGET_INCOME_CATEGORIES };
export type { BudgetCategory };
