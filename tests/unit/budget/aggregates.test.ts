import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateByCategory,
  filterByEntryType,
  filterEntriesByCategory,
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import {
  BUDGET_ENTRY_TYPE,
  BUDGET_EXPENSE_CATEGORY,
  BUDGET_FILTER_ALL,
  BUDGET_INCOME_CATEGORY,
  BUDGET_RECURRENCE,
} from "@/lib/constants/budget";
import type { BudgetExpense } from "@/lib/budget/types";

function entry(
  partial: Partial<BudgetExpense> & Pick<BudgetExpense, "id" | "category" | "amount">
): BudgetExpense {
  return {
    budget_id: "budget-1",
    entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
    description: "",
    expense_date: "2026-06-01",
    recurrence: BUDGET_RECURRENCE.NONE,
    recurrence_interval_days: null,
    recurrence_end_date: null,
    payment_reminder_enabled: false,
    reminder_sent_keys: [],
    created_by: "user-1",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

describe("sumExpensesOnly / sumIncomeOnly", () => {
  it("sums amounts by entry type", () => {
    const entries = [
      entry({ id: "1", category: BUDGET_EXPENSE_CATEGORY.BILLS, amount: 10.5 }),
      entry({ id: "2", category: BUDGET_EXPENSE_CATEGORY.CAR, amount: 20 }),
      entry({
        id: "3",
        entry_type: BUDGET_ENTRY_TYPE.INCOME,
        category: BUDGET_INCOME_CATEGORY.SALARY,
        amount: 100,
      }),
    ];
    assert.equal(sumExpensesOnly(entries), 30.5);
    assert.equal(sumIncomeOnly(entries), 100);
    assert.equal(netBalance(entries), 69.5);
  });
});

describe("aggregateByCategory", () => {
  it("groups totals per category", () => {
    const rows = aggregateByCategory(
      [
        entry({ id: "1", category: BUDGET_EXPENSE_CATEGORY.BILLS, amount: 100 }),
        entry({ id: "2", category: BUDGET_EXPENSE_CATEGORY.BILLS, amount: 50 }),
        entry({ id: "3", category: BUDGET_EXPENSE_CATEGORY.SPORT, amount: 30 }),
      ],
      [BUDGET_EXPENSE_CATEGORY.BILLS, BUDGET_EXPENSE_CATEGORY.SPORT]
    );

    const bills = rows.find((row) => row.category === BUDGET_EXPENSE_CATEGORY.BILLS);
    const sport = rows.find((row) => row.category === BUDGET_EXPENSE_CATEGORY.SPORT);
    assert.equal(bills?.total, 150);
    assert.equal(bills?.count, 2);
    assert.equal(sport?.total, 30);
  });
});

describe("filterByEntryType", () => {
  it("filters income and expenses", () => {
    const entries = [
      entry({ id: "1", category: BUDGET_EXPENSE_CATEGORY.CAR, amount: 1 }),
      entry({
        id: "2",
        entry_type: BUDGET_ENTRY_TYPE.INCOME,
        category: BUDGET_INCOME_CATEGORY.SALARY,
        amount: 2,
      }),
    ];
    assert.equal(filterByEntryType(entries, BUDGET_FILTER_ALL).length, 2);
    assert.equal(filterByEntryType(entries, BUDGET_ENTRY_TYPE.EXPENSE).length, 1);
    assert.equal(filterByEntryType(entries, BUDGET_ENTRY_TYPE.INCOME).length, 1);
  });
});

describe("filterEntriesByCategory", () => {
  it("filters by category key", () => {
    const entries = [
      entry({ id: "1", category: BUDGET_EXPENSE_CATEGORY.CAR, amount: 1 }),
      entry({ id: "2", category: BUDGET_EXPENSE_CATEGORY.OTHER, amount: 2 }),
    ];
    assert.equal(filterEntriesByCategory(entries, BUDGET_FILTER_ALL).length, 2);
    assert.equal(
      filterEntriesByCategory(entries, BUDGET_EXPENSE_CATEGORY.CAR).length,
      1
    );
  });
});
