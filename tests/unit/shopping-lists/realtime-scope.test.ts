import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  shoppingListMatchesRealtimeScope,
  shouldApplyShoppingListRealtimeEvent,
} from "@/lib/shopping-lists/realtime-scope";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import {
  testRealtimeDeletePayload,
  testRealtimeUpdatePayload,
} from "../../support/realtime-payload";

const familyList: ShoppingList = {
  id: "list-1",
  family_id: "family-1",
  name: "Groceries",
  created_by: "user-a",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("shopping list realtime scope", () => {
  it("matches family lists by family_id", () => {
    assert.equal(
      shoppingListMatchesRealtimeScope(familyList, {
        userId: "user-b",
        familyId: "family-1",
      }),
      true
    );
    assert.equal(
      shoppingListMatchesRealtimeScope(familyList, {
        userId: "user-b",
        familyId: "family-2",
      }),
      false
    );
  });

  it("matches solo lists by created_by", () => {
    const soloList = { ...familyList, family_id: null, created_by: "user-solo" };
    assert.equal(
      shoppingListMatchesRealtimeScope(soloList, {
        userId: "user-solo",
        familyId: null,
      }),
      true
    );
    assert.equal(
      shoppingListMatchesRealtimeScope(soloList, {
        userId: "other",
        familyId: null,
      }),
      false
    );
  });

  it("applies DELETE when only the list id is present in the payload", () => {
    const known = new Set(["list-1"]);
    assert.equal(
      shouldApplyShoppingListRealtimeEvent(
        testRealtimeDeletePayload("shopping_lists", { id: "list-1" }),
        { userId: "user-b", familyId: "family-1" },
        known
      ),
      true
    );
    assert.equal(
      shouldApplyShoppingListRealtimeEvent(
        testRealtimeDeletePayload("shopping_lists", { id: "other" }),
        { userId: "user-b", familyId: "family-1" },
        known
      ),
      false
    );
  });

  it("applies UPDATE when the renamed list belongs to the scope", () => {
    assert.equal(
      shouldApplyShoppingListRealtimeEvent(
        testRealtimeUpdatePayload("shopping_lists", { ...familyList, name: "Renamed" }),
        { userId: "user-b", familyId: "family-1" },
        new Set()
      ),
      true
    );
  });
});
