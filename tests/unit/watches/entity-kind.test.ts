import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WATCH_ENTITY_KIND,
  WATCH_TABLE,
  watchEntityKindFromTable,
} from "@/lib/constants/watches";

describe("watchEntityKindFromTable", () => {
  it("maps shopping list watches", () => {
    assert.equal(
      watchEntityKindFromTable(WATCH_TABLE.SHOPPING_LIST),
      WATCH_ENTITY_KIND.SHOPPING_LIST
    );
  });

  it("maps budget watches", () => {
    assert.equal(
      watchEntityKindFromTable(WATCH_TABLE.BUDGET),
      WATCH_ENTITY_KIND.BUDGET
    );
  });
});
