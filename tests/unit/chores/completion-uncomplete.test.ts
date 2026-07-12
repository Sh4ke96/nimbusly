import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_RECURRENCE, CHORE_STATUS } from "@/lib/constants/chores";
import {
  computeChoreStateAfterOccurrenceUncomplete,
  isChoreOccurrenceCompleted,
} from "@/lib/chores/completion";

describe("computeChoreStateAfterOccurrenceUncomplete", () => {
  it("removes occurrence from completed_dates and restores pending status", () => {
    const next = computeChoreStateAfterOccurrenceUncomplete(
      {
        recurrence: CHORE_RECURRENCE.NONE,
        due_date: "2026-07-15",
        recurrence_start_date: null,
        recurrence_end_date: null,
        recurrence_interval_days: null,
        completed_dates: ["2026-07-15"],
      },
      "2026-07-15"
    );

    assert.equal(next.status, CHORE_STATUS.PENDING);
    assert.equal(next.completed_at, null);
    assert.equal(isChoreOccurrenceCompleted(next, "2026-07-15"), false);
    assert.equal(next.due_date, "2026-07-15");
  });
});
