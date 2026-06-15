import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHORE_RECURRENCE,
  CHORE_RECURRENCE_DURATION,
} from "@/lib/constants/chores";
import {
  computeNextChoreDueDateWithOptions,
  computeRecurrenceEndDate,
  resolveChoreRecurrenceFields,
  shouldRescheduleChoreAfterComplete,
} from "@/lib/chores/recurrence";
import { dateToChoreDateString } from "@/lib/chores/dates";

describe("computeNextChoreDueDateWithOptions", () => {
  it("advances by custom interval days", () => {
    const from = new Date(2026, 5, 14);
    const next = computeNextChoreDueDateWithOptions(from, CHORE_RECURRENCE.CUSTOM, 3);
    assert.equal(dateToChoreDateString(next!), "2026-06-17");
  });
});

describe("computeRecurrenceEndDate", () => {
  it("adds one month from start", () => {
    const start = new Date(2026, 5, 14);
    const end = computeRecurrenceEndDate(start, CHORE_RECURRENCE_DURATION.MONTH);
    assert.equal(dateToChoreDateString(end), "2026-07-14");
  });
});

describe("resolveChoreRecurrenceFields", () => {
  it("clears fields for non-recurring chores", () => {
    const fields = resolveChoreRecurrenceFields(
      CHORE_RECURRENCE.NONE,
      2,
      CHORE_RECURRENCE_DURATION.MONTH,
      "2026-06-14"
    );
    assert.equal(fields.recurrence_interval_days, null);
    assert.equal(fields.recurrence_end_date, null);
    assert.equal(fields.recurrence_duration, null);
    assert.equal(fields.recurrence_start_date, null);
  });

  it("computes daily recurrence with start and end", () => {
    const fields = resolveChoreRecurrenceFields(
      CHORE_RECURRENCE.DAILY,
      null,
      CHORE_RECURRENCE_DURATION.MONTH,
      "2026-06-16"
    );
    assert.equal(fields.recurrence_interval_days, null);
    assert.equal(fields.recurrence_start_date, "2026-06-16");
    assert.equal(fields.recurrence_end_date, "2026-07-16");
    assert.equal(fields.recurrence_duration, CHORE_RECURRENCE_DURATION.MONTH);
  });

  it("computes custom recurrence fields from due date", () => {
    const fields = resolveChoreRecurrenceFields(
      CHORE_RECURRENCE.CUSTOM,
      2,
      CHORE_RECURRENCE_DURATION.QUARTER,
      "2026-06-14"
    );
    assert.equal(fields.recurrence_interval_days, 2);
    assert.equal(fields.recurrence_duration, CHORE_RECURRENCE_DURATION.QUARTER);
    assert.equal(fields.recurrence_start_date, "2026-06-14");
    assert.equal(fields.recurrence_end_date, "2026-09-14");
  });
});

describe("shouldRescheduleChoreAfterComplete", () => {
  it("stops rescheduling after recurrence end date", () => {
    const beforeEnd = new Date(2026, 8, 10);
    const afterEnd = new Date(2026, 8, 15);
    assert.equal(
      shouldRescheduleChoreAfterComplete({ recurrence_end_date: "2026-09-14" }, beforeEnd),
      true
    );
    assert.equal(
      shouldRescheduleChoreAfterComplete({ recurrence_end_date: "2026-09-14" }, afterEnd),
      false
    );
  });
});
