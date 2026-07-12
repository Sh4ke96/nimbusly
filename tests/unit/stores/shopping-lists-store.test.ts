import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  clearPendingItemQuantity,
  resetPendingItemQuantities,
  setPendingItemQuantity,
} from "@/lib/shopping-lists/pending-item-quantity";
import {
  clearPendingItemChecked,
  resetPendingItemChecked,
  setPendingItemChecked,
} from "@/lib/shopping-lists/pending-item-checked";
import type { ShoppingListItem } from "@/lib/shopping-lists/types";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import {
  testRealtimeDeletePayload,
  testRealtimeItemUpdatePayload,
  testRealtimeUpdatePayload,
} from "../../support/realtime-payload";

const baseItem: ShoppingListItem = {
  id: "item-1",
  list_id: "list-1",
  content: "Milk",
  checked: false,
  quantity: 1,
  category_id: null,
  sort_order: 0,
  created_by: "user-a",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const baseList: ShoppingList = {
  id: "list-1",
  family_id: "family-1",
  name: "Original",
  created_by: "user-a",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("shopping lists store realtime", () => {
  afterEach(() => {
    useShoppingListsStore.getState().reset();
    resetPendingItemQuantities();
    resetPendingItemChecked();
  });

  it("updates list name from realtime UPDATE", () => {
    useShoppingListsStore.setState({
      lists: [baseList],
      loaded: true,
    });

    useShoppingListsStore.getState().applyListChange(
      testRealtimeUpdatePayload("shopping_lists", {
        ...baseList,
        name: "Renamed",
        updated_at: "2026-01-02T00:00:00.000Z",
      })
    );

    assert.equal(useShoppingListsStore.getState().lists[0]?.name, "Renamed");
  });

  it("removes list and cached items from realtime DELETE", () => {
    useShoppingListsStore.setState({
      lists: [baseList],
      itemsByListId: {
        "list-1": [
          {
            id: "item-1",
            list_id: "list-1",
            content: "Milk",
            checked: false,
            quantity: 1,
            category_id: null,
            sort_order: 0,
            created_by: "user-a",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      loaded: true,
    });

    useShoppingListsStore.getState().applyListChange(
      testRealtimeDeletePayload("shopping_lists", { id: "list-1" })
    );

    assert.equal(useShoppingListsStore.getState().lists.length, 0);
    assert.equal(useShoppingListsStore.getState().itemsByListId["list-1"], undefined);
  });

  it("ignores stale item UPDATE when updated_at is older", () => {
    useShoppingListsStore.setState({
      itemsByListId: {
        "list-1": [{ ...baseItem, quantity: 5, updated_at: "2026-01-02T00:00:00.000Z" }],
      },
    });

    useShoppingListsStore.getState().applyItemChange(
      "list-1",
      testRealtimeItemUpdatePayload({
        ...baseItem,
        quantity: 2,
        updated_at: "2026-01-01T12:00:00.000Z",
      })
    );

    assert.equal(
      useShoppingListsStore.getState().itemsByListId["list-1"]?.[0]?.quantity,
      5
    );
  });

  it("ignores item quantity UPDATE while local pending quantity differs", () => {
    useShoppingListsStore.setState({
      itemsByListId: {
        "list-1": [{ ...baseItem, quantity: 5 }],
      },
    });
    setPendingItemQuantity("item-1", 5);

    useShoppingListsStore.getState().applyItemChange(
      "list-1",
      testRealtimeItemUpdatePayload({
        ...baseItem,
        quantity: 2,
        updated_at: "2026-01-02T00:00:00.000Z",
      })
    );

    assert.equal(
      useShoppingListsStore.getState().itemsByListId["list-1"]?.[0]?.quantity,
      5
    );

    clearPendingItemQuantity("item-1");
  });

  it("ignores item checked UPDATE while local pending checked differs", () => {
    useShoppingListsStore.setState({
      itemsByListId: {
        "list-1": [{ ...baseItem, checked: true }],
      },
    });
    setPendingItemChecked("item-1", true);

    useShoppingListsStore.getState().applyItemChange(
      "list-1",
      testRealtimeItemUpdatePayload({
        ...baseItem,
        checked: false,
        updated_at: "2026-01-02T00:00:00.000Z",
      })
    );

    assert.equal(
      useShoppingListsStore.getState().itemsByListId["list-1"]?.[0]?.checked,
      true
    );

    clearPendingItemChecked("item-1");
  });
});
