import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_RECURRENCE, CHORE_STATUS } from "@/lib/constants/chores";
import { buildChoreChangeSummary } from "@/lib/chores/changes";

const labels = {
  changeSummaryTitle: "title: {from} → {to}",
  changeSummaryStatus: "status: {from} → {to}",
  changeSummaryAssignee: "assignee: {from} → {to}",
  changeSummaryDueDate: "due date changed",
  changeSummaryRecurrence: "recurrence: {from} → {to}",
  changeSummaryNotes: "notes changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  statusLabels: {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Done",
  },
  recurrenceLabels: {
    none: "None",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
    custom: "Custom",
  },
  assigneeUnassigned: "Unassigned",
};

const base = {
  title: "Trash",
  status: CHORE_STATUS.PENDING,
  assigned_to: null,
  due_date: "2026-06-01",
  recurrence: CHORE_RECURRENCE.NONE,
  notes: "",
};

describe("buildChoreChangeSummary", () => {
  it("reports title changes", () => {
    const summary = buildChoreChangeSummary(
      base,
      { ...base, title: "Dishes" },
      labels,
      () => "Unassigned"
    );
    assert.match(summary, /title:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(
      buildChoreChangeSummary(base, base, labels, () => "Unassigned"),
      "empty"
    );
  });
});
