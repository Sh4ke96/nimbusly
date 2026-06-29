import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prefetchSearchListStores, prefetchSearchShoppingItems } from "@/lib/search/prefetch-search-stores";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";

describe("prefetch search stores", () => {
  it("skips shopping items already cached", async () => {
    useShoppingListsStore.setState({
      lists: [{ id: "list-1", name: "Test", created_by: "u1", family_id: null, created_at: "", updated_at: "" }],
      itemsByListId: { "list-1": [] },
      loaded: true,
      loading: false,
      error: false,
    });

    await prefetchSearchShoppingItems();

    assert.ok("list-1" in useShoppingListsStore.getState().itemsByListId);
  });

  it("exports list prefetch without throwing", async () => {
    await assert.doesNotReject(() => prefetchSearchListStores());
  });
});
