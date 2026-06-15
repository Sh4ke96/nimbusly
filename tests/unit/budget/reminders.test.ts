import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildBudgetReminderKey,
  daysUntilBudgetDueDate,
  getBudgetReminderOffsetsToSend,
} from "@/lib/budget/reminders";

describe("buildBudgetReminderKey", () => {
  it("combines due date and offset", () => {
    assert.equal(buildBudgetReminderKey("2026-06-14", 7), "2026-06-14:7");
  });
});

describe("daysUntilBudgetDueDate", () => {
  it("counts days until due", () => {
    const today = new Date(2026, 5, 10);
    assert.equal(daysUntilBudgetDueDate("2026-06-14", today), 4);
    assert.equal(daysUntilBudgetDueDate("2026-06-10", today), 0);
  });
});

describe("getBudgetReminderOffsetsToSend", () => {
  const today = new Date(2026, 5, 7);

  it("returns offsets matching today and skips sent keys", () => {
    const offsets = getBudgetReminderOffsetsToSend("2026-06-14", [], today);
    assert.deepEqual(offsets, [7]);

    const again = getBudgetReminderOffsetsToSend(
      "2026-06-14",
      [buildBudgetReminderKey("2026-06-14", 7)],
      today
    );
    assert.deepEqual(again, []);
  });

  it("returns multiple offsets on due day", () => {
    const dueDay = new Date(2026, 5, 14);
    const offsets = getBudgetReminderOffsetsToSend("2026-06-14", [], dueDay);
    assert.deepEqual(offsets, [0]);
  });
});
