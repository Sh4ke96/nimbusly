import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSearchIndex, filterSearchResults } from "@/lib/search/global-search";
import { pl } from "@/lib/i18n/pl";

describe("filterSearchResults", () => {
  const index = buildSearchIndex({
    moduleLabels: pl.dashboard.moduleLabels,
    budgets: [{ id: "b1", name: "Domowy budżet" }],
    shoppingLists: [{ id: "s1", name: "Biedronka" }],
    shoppingItems: [
      { id: "i1", listId: "s1", content: "Mleko", listName: "Biedronka" },
    ],
    gifts: [],
    birthdays: [{ id: "bd1", personName: "Mama" }],
    scheduleEntries: [],
    medicineItems: [],
    watchlistItems: [],
    restaurants: [],
    pets: [],
    chores: [],
  });

  it("returns modules when query is empty", () => {
    const results = filterSearchResults(index, "");
    assert.ok(results.every((item) => item.kind === "module"));
    assert.ok(results.length >= 11);
  });

  it("matches budget names and shopping items", () => {
    const budgetHits = filterSearchResults(index, "budżet");
    assert.ok(budgetHits.some((item) => item.title === "Domowy budżet"));

    const milkHits = filterSearchResults(index, "mleko");
    assert.ok(milkHits.some((item) => item.title === "Mleko"));
  });

  it("limits result count", () => {
    const results = filterSearchResults(index, "a", 3);
    assert.equal(results.length, 3);
  });
});
