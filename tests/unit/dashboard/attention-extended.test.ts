import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BUDGET_ENTRY_TYPE, BUDGET_RECURRENCE } from "@/lib/constants/budget";
import { isBudgetPaymentDueSoon } from "@/lib/budget/attention";
import { isNoteMarkedUrgent, formatUrgentNoteTitle } from "@/lib/notes/attention";
import { isScheduleEntryEndingSoon } from "@/lib/schedule/attention";

describe("isBudgetPaymentDueSoon", () => {
  it("returns true when payment reminder is due within offset window", () => {
    const today = new Date("2026-06-14");
    assert.equal(
      isBudgetPaymentDueSoon(
        {
          entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
          expense_date: "2026-06-21",
          recurrence: BUDGET_RECURRENCE.NONE,
          recurrence_end_date: null,
          payment_reminder_enabled: true,
        },
        today
      ),
      true
    );
  });

  it("returns true for overdue one-time expense with reminder enabled", () => {
    const today = new Date("2026-06-23");
    assert.equal(
      isBudgetPaymentDueSoon(
        {
          entry_type: BUDGET_ENTRY_TYPE.EXPENSE,
          expense_date: "2026-06-21",
          recurrence: BUDGET_RECURRENCE.NONE,
          recurrence_end_date: null,
          payment_reminder_enabled: true,
        },
        today
      ),
      true
    );
  });
});

describe("isScheduleEntryEndingSoon", () => {
  it("returns true for multi-day entries ending soon", () => {
    const today = new Date("2026-06-14");
    assert.equal(
      isScheduleEntryEndingSoon(
        { entry_date: "2026-06-10", entry_end_date: "2026-06-16" },
        today
      ),
      true
    );
  });
});

describe("isNoteMarkedUrgent", () => {
  it("detects urgent prefix and formats title", () => {
    assert.equal(isNoteMarkedUrgent({ title: "! Hasło WiFi" }), true);
    assert.equal(formatUrgentNoteTitle("! Hasło WiFi"), "Hasło WiFi");
  });
});
