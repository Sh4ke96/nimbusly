import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHORE_RECURRENCE,
  CHORE_STATUS,
} from "@/lib/constants/chores";
import {
  computeNextChoreDueDate,
  dateToChoreDateString,
  isValidChoreDateString,
  isValidChoreRecurrence,
  isValidChoreStatus,
  isValidChoreTitle,
  normalizeChoreTitle,
  parseChoreTaskFromForm,
} from "@/lib/chores/types";

describe("normalizeChoreTitle", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeChoreTitle("  Zmywarka  "), "Zmywarka");
  });
});

describe("isValidChoreTitle", () => {
  it("accepts non-empty titles", () => {
    assert.equal(isValidChoreTitle("Odkurzanie"), true);
    assert.equal(isValidChoreTitle("   "), false);
  });
});

describe("isValidChoreStatus", () => {
  it("accepts known statuses", () => {
    assert.equal(isValidChoreStatus(CHORE_STATUS.PENDING), true);
    assert.equal(isValidChoreStatus("archived"), false);
  });
});

describe("isValidChoreRecurrence", () => {
  it("accepts known recurrence values", () => {
    assert.equal(isValidChoreRecurrence(CHORE_RECURRENCE.WEEKLY), true);
    assert.equal(isValidChoreRecurrence(CHORE_RECURRENCE.CUSTOM), true);
    assert.equal(isValidChoreRecurrence("yearly"), false);
  });
});

describe("isValidChoreDateString", () => {
  it("accepts ISO dates and empty values", () => {
    assert.equal(isValidChoreDateString("2026-06-14"), true);
    assert.equal(isValidChoreDateString(""), true);
    assert.equal(isValidChoreDateString("bad"), false);
  });
});

describe("computeNextChoreDueDate", () => {
  it("advances due date by recurrence", () => {
    const from = new Date(2026, 5, 14);
    const weekly = computeNextChoreDueDate(from, CHORE_RECURRENCE.WEEKLY);
    assert.equal(dateToChoreDateString(weekly!), "2026-06-21");
    assert.equal(computeNextChoreDueDate(from, CHORE_RECURRENCE.NONE), null);

    const custom = computeNextChoreDueDate(from, CHORE_RECURRENCE.CUSTOM, 2);
    assert.equal(dateToChoreDateString(custom!), "2026-06-16");
  });
});

describe("parseChoreTaskFromForm", () => {
  it("parses chore fields from form data", () => {
    const formData = new FormData();
    formData.set("title", "  Śmieci ");
    formData.set("status", CHORE_STATUS.PENDING);
    formData.set("recurrence", CHORE_RECURRENCE.WEEKLY);
    formData.set("dueDate", "2026-06-20");

    const parsed = parseChoreTaskFromForm(formData);
    assert.equal(parsed.title, "Śmieci");
    assert.equal(parsed.status, CHORE_STATUS.PENDING);
    assert.equal(parsed.recurrence, CHORE_RECURRENCE.WEEKLY);
    assert.equal(parsed.dueDate, "2026-06-20");
    assert.equal(parsed.assignedTo, null);
  });
});
