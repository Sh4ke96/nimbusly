import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupShoppingItemsByCategory } from "@/lib/shopping-lists/categories";
import type { ShoppingListItem } from "@/lib/shopping-lists/types";

function item(
  partial: Partial<ShoppingListItem> & Pick<ShoppingListItem, "id">
): ShoppingListItem {
  return {
    list_id: "list-1",
    content: "Bread",
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

describe("groupShoppingItemsByCategory", () => {
  it("places items only in the selected category group", () => {
    const groups = groupShoppingItemsByCategory(
      [
        item({ id: "a", category_id: "cat-bread", content: "Chleb" }),
      ],
      [
        {
          id: "cat-bread",
          family_id: "family-1",
          created_by: "user-1",
          name: "Pieczywo",
          sort_order: 0,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "cat-dairy",
          family_id: "family-1",
          created_by: "user-1",
          name: "Nabiał",
          sort_order: 1,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      "Bez kategorii"
    );

    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.name, "Pieczywo");
    assert.deepEqual(groups[0]?.items.map((entry) => entry.id), ["a"]);
  });
});
