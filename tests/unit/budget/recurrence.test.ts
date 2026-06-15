import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  advanceBudgetRecurrenceDate,
  expandBudgetEntriesForMonth,
  getBudgetOccurrenceDatesInMonth,
  getNextBudgetDueDate,
  isValidBudgetRecurrence,
} from "@/lib/budget/recurrence";
import { BUDGET_RECURRENCE } from "@/lib/constants/budget";

describe("isValidBudgetRecurrence", () => {
  it("accepts known values", () => {
    assert.equal(isValidBudgetRecurrence("monthly"), true);
    assert.equal(isValidBudgetRecurrence("invalid"), false);
  });
});

describe("getBudgetOccurrenceDatesInMonth", () => {
  it("returns single date for non-recurring entry in month", () => {
    const dates = getBudgetOccurrenceDatesInMonth(
      {
        expense_date: "2026-06-14",
        recurrence: BUDGET_RECURRENCE.NONE,
        recurrence_end_date: null,
      },
      "2026-06"
    );
    assert.deepEqual(dates, ["2026-06-14"]);
  });

  it("expands monthly recurrence within month", () => {
    const dates = getBudgetOccurrenceDatesInMonth(
      {
        expense_date: "2026-01-14",
        recurrence: BUDGET_RECURRENCE.MONTHLY,
        recurrence_end_date: null,
      },
      "2026-06"
    );
    assert.deepEqual(dates, ["2026-06-14"]);
  });

  it("respects recurrence end date", () => {
    const dates = getBudgetOccurrenceDatesInMonth(
      {
        expense_date: "2026-01-14",
        recurrence: BUDGET_RECURRENCE.MONTHLY,
        recurrence_end_date: "2026-03-14",
      },
      "2026-06"
    );
    assert.deepEqual(dates, []);
  });
});

describe("getNextBudgetDueDate", () => {
  const today = new Date(2026, 5, 10);

  it("returns upcoming one-time due date", () => {
    assert.equal(
      getNextBudgetDueDate(
        {
          expense_date: "2026-06-14",
          recurrence: BUDGET_RECURRENCE.NONE,
          recurrence_end_date: null,
        },
        today
      ),
      "2026-06-14"
    );
  });

  it("skips past one-time due dates", () => {
    assert.equal(
      getNextBudgetDueDate(
        {
          expense_date: "2026-06-01",
          recurrence: BUDGET_RECURRENCE.NONE,
          recurrence_end_date: null,
        },
        today
      ),
      null
    );
  });

  it("advances recurring due dates", () => {
    assert.equal(
      getNextBudgetDueDate(
        {
          expense_date: "2026-01-14",
          recurrence: BUDGET_RECURRENCE.MONTHLY,
          recurrence_end_date: null,
        },
        today
      ),
      "2026-06-14"
    );
  });
});

describe("expandBudgetEntriesForMonth", () => {
  it("duplicates recurring entries per occurrence", () => {
    const expanded = expandBudgetEntriesForMonth(
      [
        {
          id: "1",
          expense_date: "2026-01-07",
          recurrence: BUDGET_RECURRENCE.WEEKLY,
          recurrence_end_date: null,
        },
      ],
      "2026-01"
    );
    assert.ok(expanded.length >= 4);
    assert.equal(expanded[0].expense_date, expanded[0].occurrence_date);
  });
});

describe("advanceBudgetRecurrenceDate", () => {
  it("adds one month for monthly recurrence", () => {
    const from = new Date(2026, 0, 15);
    const next = advanceBudgetRecurrenceDate(from, BUDGET_RECURRENCE.MONTHLY);
    assert.equal(next?.getMonth(), 1);
    assert.equal(next?.getDate(), 15);
  });
});
