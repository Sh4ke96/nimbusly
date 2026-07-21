import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { normalizeChoreStatusForDisplay } from "@/lib/chores/display-status";
import { countChoresByStatus, filterChoresByStatus } from "@/lib/chores/filters";
import type { ChoreTask } from "@/lib/chores/types";

function task(overrides: Partial<ChoreTask> & Pick<ChoreTask, "id" | "status">): ChoreTask {
  return {
    family_id: "family-1",
    title: "Task",
    notes: "",
    icon_emoji: null,
    assigned_to: null,
    due_date: null,
    recurrence: "none",
    recurrence_interval_days: null,
    recurrence_end_date: null,
    recurrence_duration: null,
    recurrence_start_date: null,
    completed_at: null,
    completed_dates: [],
    created_by: "user-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeChoreStatusForDisplay", () => {
  it("maps legacy in_progress to pending", () => {
    assert.equal(
      normalizeChoreStatusForDisplay(CHORE_STATUS.IN_PROGRESS),
      CHORE_STATUS.PENDING
    );
  });
});

describe("chore status filters", () => {
  const items = [
    task({ id: "1", status: CHORE_STATUS.PENDING }),
    task({ id: "2", status: CHORE_STATUS.IN_PROGRESS }),
    task({ id: "3", status: CHORE_STATUS.COMPLETED }),
  ];

  it("groups in_progress under pending counts", () => {
    const counts = countChoresByStatus(items);
    assert.equal(counts.pending, 2);
    assert.equal(counts.in_progress, 0);
    assert.equal(counts.completed, 1);
  });

  it("includes in_progress tasks in pending filter", () => {
    const pending = filterChoresByStatus(items, CHORE_STATUS.PENDING);
    assert.deepEqual(
      pending.map((item) => item.id),
      ["1", "2"]
    );
  });
});
