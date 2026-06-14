import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  watchedBudgetIdsFromRows,
} from "@/lib/budget/watches";
import { excludeActorFromWatcherIds } from "@/lib/notifications/watches";

describe("excludeActorFromWatcherIds", () => {
  it("removes actor from watcher list", () => {
    assert.deepEqual(excludeActorFromWatcherIds(["a", "b", "c"], "b"), ["a", "c"]);
  });
});

describe("watchedBudgetIdsFromRows", () => {
  it("maps budget ids from rows", () => {
    assert.deepEqual(
      watchedBudgetIdsFromRows([{ budget_id: "b1" }, { budget_id: "b2" }]),
      ["b1", "b2"]
    );
  });
});
