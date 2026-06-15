import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countActiveFilters, FILTER_ALL_VALUE } from "@/lib/filters/active-count";

describe("countActiveFilters", () => {
  it("counts values different from the all sentinel", () => {
    assert.equal(countActiveFilters(["all", "all"]), 0);
    assert.equal(countActiveFilters(["movie", "all"], FILTER_ALL_VALUE), 1);
    assert.equal(
      countActiveFilters(["movie", "netflix", "all"], FILTER_ALL_VALUE),
      2
    );
  });
});
