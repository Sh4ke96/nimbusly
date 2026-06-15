import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyItemOrder,
  isValidShoppingItemContent,
  isValidShoppingListName,
  normalizeShoppingItemContent,
  normalizeShoppingListName,
  parseOrderedItemIds,
  sortShoppingListItems,
  type ShoppingListItem,
} from "@/lib/shopping-lists/types";

function item(
  partial: Partial<ShoppingListItem> & Pick<ShoppingListItem, "id">
): ShoppingListItem {
  return {
    list_id: "list-1",
    content: "Milk",
    checked: false,
    quantity: 1,
    category_id: null,
    sort_order: 0,
    created_by: "user-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("normalizeShoppingListName", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeShoppingListName("  weekly   shop  "), "weekly shop");
  });
});

describe("isValidShoppingListName", () => {
  it("requires non-empty names within limit", () => {
    assert.equal(isValidShoppingListName("Groceries"), true);
    assert.equal(isValidShoppingListName("   "), false);
    assert.equal(isValidShoppingListName("a".repeat(201)), false);
  });
});

describe("isValidShoppingItemContent", () => {
  it("requires non-empty content within limit", () => {
    assert.equal(isValidShoppingItemContent("Milk"), true);
    assert.equal(isValidShoppingItemContent("   "), false);
    assert.equal(isValidShoppingItemContent("a".repeat(501)), false);
  });
});

describe("normalizeShoppingItemContent", () => {
  it("trims item text", () => {
    assert.equal(normalizeShoppingItemContent("  eggs  "), "eggs");
  });
});

describe("sortShoppingListItems", () => {
  it("sorts by sort_order then created_at", () => {
    const sorted = sortShoppingListItems([
      item({ id: "b", sort_order: 1, created_at: "2026-01-02T00:00:00.000Z" }),
      item({ id: "a", sort_order: 0, created_at: "2026-01-03T00:00:00.000Z" }),
      item({ id: "c", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" }),
    ]);

    assert.deepEqual(
      sorted.map((entry) => entry.id),
      ["a", "c", "b"]
    );
  });
});

describe("applyItemOrder", () => {
  it("reorders known ids and appends unknown items", () => {
    const items = [
      item({ id: "a", sort_order: 0 }),
      item({ id: "b", sort_order: 1 }),
      item({ id: "c", sort_order: 2 }),
    ];

    const reordered = applyItemOrder(items, ["c", "a"]);
    assert.deepEqual(
      reordered.map((entry) => entry.id),
      ["c", "a", "b"]
    );
    assert.equal(reordered[0]?.sort_order, 0);
    assert.equal(reordered[1]?.sort_order, 1);
    assert.equal(reordered[2]?.sort_order, 2);
  });
});

describe("parseOrderedItemIds", () => {
  it("parses string arrays only", () => {
    assert.deepEqual(parseOrderedItemIds('["a","b"]'), ["a", "b"]);
    assert.deepEqual(parseOrderedItemIds("[]"), []);
    assert.equal(parseOrderedItemIds('["a",1]'), null);
    assert.equal(parseOrderedItemIds("not-json"), null);
  });
});
