import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildShoppingListChangeSummary } from "@/lib/shopping-lists/changes";

const labels = {
  changeSummaryName: "name: {from} → {to}",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
};

const base = {
  name: "Weekly groceries",
};

describe("buildShoppingListChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildShoppingListChangeSummary(
      base,
      { ...base, name: "Party supplies" },
      labels
    );
    assert.match(summary, /name:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildShoppingListChangeSummary(base, base, labels), "empty");
  });
});
