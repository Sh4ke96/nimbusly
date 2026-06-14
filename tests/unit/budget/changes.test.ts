import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildBudgetChangeSummary } from "@/lib/budget/changes";

const labels = {
  changeSummaryName: "name: {from} → {to}",
  changeSummaryEmpty: "empty",
};

const base = {
  name: "Groceries",
};

describe("buildBudgetChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildBudgetChangeSummary(
      base,
      { ...base, name: "Transport" },
      labels
    );
    assert.match(summary, /name:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildBudgetChangeSummary(base, base, labels), "empty");
  });
});
