import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEDULE_ENTRY_TYPE } from "@/lib/constants/schedule";
import { buildScheduleChangeSummary } from "@/lib/schedule/changes";

const base = {
  entry_date: "2026-06-14",
  entry_end_date: null,
  entry_type: SCHEDULE_ENTRY_TYPE.WORK,
  description: "",
};

const labels = {
  changeSummaryType: "type: {from} → {to}",
  changeSummaryDate: "date: {from} → {to}",
  changeSummaryDescription: "description changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  dateRangeSeparator: " - ",
  typeLabels: {
    work: "Work",
    free: "Free",
    shopping: "Shopping",
    training: "Training",
    doctor: "Doctor",
    trip: "Trip",
  },
};

describe("buildScheduleChangeSummary", () => {
  it("reports type changes", () => {
    const summary = buildScheduleChangeSummary(
      base,
      { ...base, entry_type: SCHEDULE_ENTRY_TYPE.FREE },
      labels
    );
    assert.match(summary, /type:/);
  });

  it("reports date range changes", () => {
    const summary = buildScheduleChangeSummary(
      base,
      { ...base, entry_end_date: "2026-06-20" },
      labels
    );
    assert.match(summary, /date:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildScheduleChangeSummary(base, base, labels), "empty");
  });
});
