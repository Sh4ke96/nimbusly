import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectNimbusSuggestions,
  NIMBUS_SUGGESTION_ID,
} from "@/lib/nimbus/suggestions";
import type { SearchStoresSnapshot } from "@/lib/search/search-stores-snapshot";

function emptySnapshot(overrides: Partial<SearchStoresSnapshot> = {}): SearchStoresSnapshot {
  return {
    profile: null,
    members: [],
    budgets: [],
    expensesByBudgetId: {},
    shoppingLists: [],
    itemsByListId: {},
    gifts: [],
    birthdays: [],
    scheduleEntries: [],
    medicineItems: [],
    watchlistItems: [],
    restaurants: [],
    pets: [],
    petCareItems: [],
    chores: [],
    notes: [],
    noteCategories: [],
    ...overrides,
  };
}

describe("detectNimbusSuggestions", () => {
  it("suggests empty dashboard when no core data exists", () => {
    const ids = detectNimbusSuggestions(emptySnapshot(), false);
    assert.ok(ids.includes(NIMBUS_SUGGESTION_ID.EMPTY_DASHBOARD));
  });

  it("suggests budget entries when budget exists without expenses", () => {
    const ids = detectNimbusSuggestions(
      emptySnapshot({
        budgets: [{ id: "b1" } as SearchStoresSnapshot["budgets"][number]],
      }),
      false
    );
    assert.ok(ids.includes(NIMBUS_SUGGESTION_ID.BUDGET_NO_ENTRIES));
    assert.ok(!ids.includes(NIMBUS_SUGGESTION_ID.EMPTY_DASHBOARD));
  });

  it("suggests family birthdays only on family accounts", () => {
    const snapshot = emptySnapshot({
      shoppingLists: [{ id: "l1" } as SearchStoresSnapshot["shoppingLists"][number]],
    });
    assert.ok(!detectNimbusSuggestions(snapshot, false).includes(NIMBUS_SUGGESTION_ID.FAMILY_NO_BIRTHDAYS));
    assert.ok(detectNimbusSuggestions(snapshot, true).includes(NIMBUS_SUGGESTION_ID.FAMILY_NO_BIRTHDAYS));
  });

  it("suggests watchlist when other modules have data", () => {
    const ids = detectNimbusSuggestions(
      emptySnapshot({
        notes: [{ id: "n1" } as SearchStoresSnapshot["notes"][number]],
      }),
      false
    );
    assert.ok(ids.includes(NIMBUS_SUGGESTION_ID.WATCHLIST_EMPTY));
  });
});
