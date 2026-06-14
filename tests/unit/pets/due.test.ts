import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PET_DUE_STATUS } from "@/lib/constants/pets";
import {
  daysUntilDue,
  formatPetDueCountdown,
  getPetDueStatus,
  isPetCareDueSoon,
  sortPetCareByDue,
} from "@/lib/pets/due";

const labels = {
  dueToday: "today",
  dueInDays: "in {count} days",
  dueOverdue: "overdue",
  dueSoon: "soon",
};

describe("getPetDueStatus", () => {
  it("classifies due dates relative to today", () => {
    const today = new Date(2026, 5, 14);
    assert.equal(getPetDueStatus(null, today), PET_DUE_STATUS.NONE);
    assert.equal(getPetDueStatus("2026-08-01", today), PET_DUE_STATUS.OK);
    assert.equal(getPetDueStatus("2026-06-20", today), PET_DUE_STATUS.WARNING);
    assert.equal(getPetDueStatus("2026-06-01", today), PET_DUE_STATUS.OVERDUE);
  });
});

describe("daysUntilDue", () => {
  it("returns day difference", () => {
    const today = new Date(2026, 5, 14);
    assert.equal(daysUntilDue("2026-06-16", today), 2);
    assert.equal(daysUntilDue("2026-06-14", today), 0);
  });
});

describe("isPetCareDueSoon", () => {
  it("is true for warning and overdue", () => {
    const today = new Date(2026, 5, 14);
    assert.equal(isPetCareDueSoon("2026-06-01", today), true);
    assert.equal(isPetCareDueSoon("2026-08-01", today), false);
  });
});

describe("formatPetDueCountdown", () => {
  it("formats countdown labels", () => {
    const today = new Date(2026, 5, 14);
    assert.equal(formatPetDueCountdown("2026-08-01", labels, today), null);
    assert.equal(formatPetDueCountdown("2026-06-01", labels, today), "overdue");
    assert.equal(formatPetDueCountdown("2026-06-14", labels, today), "today");
    assert.equal(formatPetDueCountdown("2026-06-20", labels, today), "in 6 days");
  });
});

describe("sortPetCareByDue", () => {
  it("sorts by next due date then name", () => {
    const sorted = sortPetCareByDue([
      { next_due_date: "2026-07-01", name: "B" },
      { next_due_date: "2026-06-01", name: "A" },
      { next_due_date: null, name: "C" },
    ]);
    assert.equal(sorted[0].name, "A");
    assert.equal(sorted[1].name, "B");
    assert.equal(sorted[2].name, "C");
  });
});
