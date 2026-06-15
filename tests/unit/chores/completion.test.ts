import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHORE_RECURRENCE,
  CHORE_RECURRENCE_DURATION,
  CHORE_STATUS,
} from "@/lib/constants/chores";
import {
  computeChoreStateAfterOccurrenceComplete,
  findNextIncompleteOccurrenceDate,
  normalizeCompletedDates,
} from "@/lib/chores/completion";
import type { ChoreTask } from "@/lib/chores/types";

function dailyTask(partial: Partial<ChoreTask> = {}): ChoreTask {
  return {
    id: "1",
    family_id: null,
    title: "Śmieci",
    notes: "",
    icon_emoji: null,
    status: CHORE_STATUS.PENDING,
    assigned_to: null,
    due_date: "2026-06-16",
    recurrence: CHORE_RECURRENCE.DAILY,
    recurrence_interval_days: null,
    recurrence_end_date: "2026-06-18",
    recurrence_duration: CHORE_RECURRENCE_DURATION.MONTH,
    recurrence_start_date: "2026-06-16",
    completed_dates: [],
    completed_at: null,
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("computeChoreStateAfterOccurrenceComplete", () => {
  it("marks one day and advances due date in a daily series", () => {
    const next = computeChoreStateAfterOccurrenceComplete(dailyTask(), "2026-06-16");
    assert.deepEqual(next.completed_dates, ["2026-06-16"]);
    assert.equal(next.due_date, "2026-06-17");
    assert.equal(next.status, CHORE_STATUS.PENDING);
    assert.equal(next.completed_at, null);
  });

  it("finishes the series after the last day", () => {
    const next = computeChoreStateAfterOccurrenceComplete(
      dailyTask({ completed_dates: ["2026-06-16", "2026-06-17"], due_date: "2026-06-18" }),
      "2026-06-18"
    );
    assert.deepEqual(normalizeCompletedDates(next.completed_dates), [
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
    ]);
    assert.equal(next.due_date, null);
    assert.equal(next.status, CHORE_STATUS.COMPLETED);
    assert.ok(next.completed_at);
  });
});

describe("findNextIncompleteOccurrenceDate", () => {
  it("skips completed days", () => {
    assert.equal(
      findNextIncompleteOccurrenceDate(dailyTask({ completed_dates: ["2026-06-16"] })),
      "2026-06-17"
    );
  });
});
