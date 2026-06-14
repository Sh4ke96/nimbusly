import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildBirthdayChangeSummary } from "@/lib/birthdays/changes";

const labels = {
  changeSummaryName: "name: {from} → {to}",
  changeSummaryDate: "date: {from} → {to}",
  changeSummaryDescription: "description changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
};

const base = {
  person_name: "Anna",
  birth_month: 6,
  birth_day: 14,
  description: "",
};

describe("buildBirthdayChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildBirthdayChangeSummary(
      base,
      { ...base, person_name: "Bartek" },
      labels
    );
    assert.match(summary, /name:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildBirthdayChangeSummary(base, base, labels), "empty");
  });
});
