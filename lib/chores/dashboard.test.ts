import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { countActiveChores, pickActiveChorePreview } from "@/lib/chores/dashboard";

describe("pickActiveChorePreview", () => {
  it("returns only pending and in-progress tasks", () => {
    const preview = pickActiveChorePreview(
      [
        {
          id: "1",
          family_id: null,
          title: "A",
          notes: "",
          status: CHORE_STATUS.COMPLETED,
          assigned_to: null,
          due_date: null,
          recurrence: "none",
          completed_at: null,
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          family_id: null,
          title: "B",
          notes: "",
          status: CHORE_STATUS.PENDING,
          assigned_to: null,
          due_date: "2026-06-20",
          recurrence: "none",
          completed_at: null,
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      3
    );
    assert.equal(preview.length, 1);
    assert.equal(preview[0].id, "2");
  });
});

describe("countActiveChores", () => {
  it("counts active chores", () => {
    const count = countActiveChores([
      {
        id: "1",
        family_id: null,
        title: "A",
        notes: "",
        status: CHORE_STATUS.PENDING,
        assigned_to: null,
        due_date: null,
        recurrence: "none",
        completed_at: null,
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
      {
        id: "2",
        family_id: null,
        title: "B",
        notes: "",
        status: CHORE_STATUS.COMPLETED,
        assigned_to: null,
        due_date: null,
        recurrence: "none",
        completed_at: null,
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ]);
    assert.equal(count, 1);
  });
});
