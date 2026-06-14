import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterEntriesByMonth,
  formatMonthKeyLabel,
  getCurrentMonthKey,
  shiftMonthKey,
} from "@/lib/budget/monthly";
import { BUDGET_ENTRY_TYPE, BUDGET_EXPENSE_CATEGORY } from "@/lib/constants/budget";
import type { BudgetExpense } from "@/lib/budget/types";

function entry(expenseDate: string): BudgetExpense {
  return {
    id: "1",
    budget_id: "b1",
    entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
    category: BUDGET_EXPENSE_CATEGORY.BILLS,
    amount: 10,
    description: "",
    expense_date: expenseDate,
    created_by: "u1",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

describe("filterEntriesByMonth", () => {
  it("filters by YYYY-MM prefix", () => {
    const rows = [entry("2026-06-10"), entry("2026-05-31"), entry("2026-06-01")];
    assert.equal(filterEntriesByMonth(rows, "2026-06").length, 2);
  });
});

describe("shiftMonthKey", () => {
  it("moves across month boundaries", () => {
    assert.equal(shiftMonthKey("2026-01", -1), "2025-12");
    assert.equal(shiftMonthKey("2025-12", 1), "2026-01");
  });
});

describe("formatMonthKeyLabel", () => {
  it("uses month names", () => {
    assert.equal(
      formatMonthKeyLabel("2026-06", [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ]),
      "Jun 2026"
    );
  });
});

describe("getCurrentMonthKey", () => {
  it("formats as YYYY-MM", () => {
    assert.equal(getCurrentMonthKey(new Date(2026, 5, 14)), "2026-06");
  });
});
