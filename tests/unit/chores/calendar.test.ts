import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_RECURRENCE, CHORE_RECURRENCE_DURATION, CHORE_STATUS } from "@/lib/constants/chores";
import { getChoreOccurrencesInMonth } from "@/lib/chores/calendar";
import type { ChoreTask } from "@/lib/chores/types";

function task(partial: Partial<ChoreTask>): ChoreTask {
  return {
    id: "1",
    family_id: null,
    title: "Śmieci",
    notes: "",
    icon_emoji: "🗑️",
    completed_dates: [],
    status: CHORE_STATUS.PENDING,
    assigned_to: null,
    due_date: "2026-06-16",
    recurrence: CHORE_RECURRENCE.DAILY,
    recurrence_interval_days: null,
    recurrence_end_date: "2026-06-20",
    recurrence_duration: CHORE_RECURRENCE_DURATION.MONTH,
    recurrence_start_date: "2026-06-16",
    completed_at: null,
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("getChoreOccurrencesInMonth", () => {
  it("expands daily chores across the month", () => {
    const occurrences = getChoreOccurrencesInMonth([task({})], 2026, 6);
    assert.equal(occurrences.length, 5);
    assert.equal(occurrences[0].date, "2026-06-16");
    assert.equal(occurrences[4].date, "2026-06-20");
  });
});
