import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  excludeActorFromWatcherIds,
  isShoppingListWatched,
  watchedListIdsFromRows,
} from "@/lib/shopping-lists/watches";

describe("isShoppingListWatched", () => {
  it("checks membership in array or set", () => {
    assert.equal(isShoppingListWatched(["a", "b"], "a"), true);
    assert.equal(isShoppingListWatched(["a", "b"], "c"), false);
    assert.equal(isShoppingListWatched(new Set(["a"]), "a"), true);
  });
});

describe("watchedListIdsFromRows", () => {
  it("maps list ids from watch rows", () => {
    assert.deepEqual(
      watchedListIdsFromRows([
        { list_id: "list-1" },
        { list_id: "list-2" },
      ]),
      ["list-1", "list-2"]
    );
  });
});

describe("excludeActorFromWatcherIds", () => {
  it("removes the actor from watcher recipients", () => {
    assert.deepEqual(
      excludeActorFromWatcherIds(["u1", "u2", "u3"], "u2"),
      ["u1", "u3"]
    );
  });
});
