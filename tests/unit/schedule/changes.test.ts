import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEDULE_ENTRY_TYPE } from "@/lib/constants/schedule";
import { buildScheduleChangeSummary } from "@/lib/schedule/changes";

const labels = {
  changeSummaryType: "type: {from} → {to}",
  changeSummaryDate: "date: {from} → {to}",
  changeSummaryDescription: "description changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  typeLabels: {
    work: "Work",
    free: "Free",
    shopping: "Shopping",
    training: "Training",
    doctor: "Doctor",
    trip: "Trip",
  },
};

const base = {
  entry_date: "2026-06-14",
  entry_type: SCHEDULE_ENTRY_TYPE.WORK,
  description: "",
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

  it("returns empty summary when unchanged", () => {
    assert.equal(buildScheduleChangeSummary(base, base, labels), "empty");
  });
});
