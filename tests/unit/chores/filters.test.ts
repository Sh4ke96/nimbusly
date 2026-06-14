import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHORE_FILTER_ALL,
  CHORE_STATUS,
} from "@/lib/constants/chores";
import {
  countActiveChores,
  countChoresByStatus,
  filterChoresByAssignee,
  filterChoresByStatus,
  isChoreOverdue,
  sortChoresForDisplay,
} from "@/lib/chores/filters";
import type { ChoreTask } from "@/lib/chores/types";

function task(partial: Partial<ChoreTask>): ChoreTask {
  return {
    id: "1",
    family_id: null,
    title: "Odkurzanie",
    notes: "",
    status: CHORE_STATUS.PENDING,
    assigned_to: null,
    due_date: null,
    recurrence: "none",
    completed_at: null,
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("filterChoresByStatus", () => {
  it("filters by status", () => {
    const items = [
      task({ id: "1", status: CHORE_STATUS.PENDING }),
      task({ id: "2", status: CHORE_STATUS.COMPLETED }),
    ];
    assert.equal(filterChoresByStatus(items, CHORE_FILTER_ALL).length, 2);
    assert.equal(filterChoresByStatus(items, CHORE_STATUS.COMPLETED).length, 1);
  });
});

describe("filterChoresByAssignee", () => {
  it("filters by assignee including unassigned", () => {
    const items = [
      task({ id: "1", assigned_to: "u1" }),
      task({ id: "2", assigned_to: null }),
    ];
    assert.equal(filterChoresByAssignee(items, "u1").length, 1);
    assert.equal(filterChoresByAssignee(items, "unassigned").length, 1);
  });
});

describe("countChoresByStatus", () => {
  it("counts items per status", () => {
    const counts = countChoresByStatus([
      task({ status: CHORE_STATUS.PENDING }),
      task({ id: "2", status: CHORE_STATUS.PENDING }),
      task({ id: "3", status: CHORE_STATUS.COMPLETED }),
    ]);
    assert.equal(counts.all, 3);
    assert.equal(counts.pending, 2);
    assert.equal(counts.completed, 1);
  });
});

describe("countActiveChores", () => {
  it("counts pending and in-progress tasks", () => {
    const count = countActiveChores([
      task({ status: CHORE_STATUS.PENDING }),
      task({ id: "2", status: CHORE_STATUS.IN_PROGRESS }),
      task({ id: "3", status: CHORE_STATUS.COMPLETED }),
    ]);
    assert.equal(count, 2);
  });
});

describe("isChoreOverdue", () => {
  it("detects overdue active tasks", () => {
    const today = new Date(2026, 5, 14);
    assert.equal(
      isChoreOverdue(task({ due_date: "2026-06-01", status: CHORE_STATUS.PENDING }), today),
      true
    );
    assert.equal(
      isChoreOverdue(task({ due_date: "2026-06-01", status: CHORE_STATUS.COMPLETED }), today),
      false
    );
  });
});

describe("sortChoresForDisplay", () => {
  it("sorts pending before completed", () => {
    const sorted = sortChoresForDisplay([
      task({ id: "1", status: CHORE_STATUS.COMPLETED }),
      task({ id: "2", status: CHORE_STATUS.PENDING, due_date: "2026-06-20" }),
    ]);
    assert.equal(sorted[0].id, "2");
    assert.equal(sorted[1].id, "1");
  });
});
