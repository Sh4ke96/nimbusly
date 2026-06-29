import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { APP_MODULE_IDS } from "@/lib/constants/app-modules";
import { buildSearchIndex, filterSearchResults } from "@/lib/search/global-search";
import { pl } from "@/lib/i18n/pl";

const baseInput = {
  moduleLabels: pl.dashboard.moduleLabels,
  moduleDescs: pl.dashboard.moduleDescs,
  familyHref: "/family",
  budgets: [{ id: "b1", name: "Domowy budżet" }],
  budgetEntries: [
    {
      id: "be1",
      budgetId: "b1",
      budgetName: "Domowy budżet",
      description: "Czynsz",
      category: "bills",
      entryType: "expense",
    },
  ],
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
  petCareItems: [],
  chores: [],
  notes: [{ id: "n1", title: "Hasło WiFi", content: "router 192.168.0.1" }],
  noteCategories: [{ id: "nc1", name: "Dom" }],
  familyMembers: [{ id: "m1", name: "Tata" }],
};

describe("filterSearchResults", () => {
  const index = buildSearchIndex(baseInput);

  it("returns all modules when query is empty", () => {
    const results = filterSearchResults(index, "");
    assert.ok(results.every((item) => item.kind === "module"));
    assert.equal(results.length, APP_MODULE_IDS.length);
  });

  it("matches budget names, entries, and shopping items", () => {
    const budgetHits = filterSearchResults(index, "budżet");
    assert.ok(budgetHits.some((item) => item.title === "Domowy budżet"));
    assert.ok(budgetHits.some((item) => item.title === "Czynsz"));

    const milkHits = filterSearchResults(index, "mleko");
    assert.ok(milkHits.some((item) => item.title === "Mleko"));
  });

  it("matches note content and categories", () => {
    const wifiHits = filterSearchResults(index, "router");
    assert.ok(wifiHits.some((item) => item.title === "Hasło WiFi"));

    const categoryHits = filterSearchResults(index, "dom");
    assert.ok(categoryHits.some((item) => item.title === "Dom"));
  });

  it("matches module descriptions", () => {
    const hits = filterSearchResults(index, "zakupy");
    assert.ok(hits.some((item) => item.kind === "module" && item.title === "Zakupy"));
  });

  it("limits result count", () => {
    const results = filterSearchResults(index, "a", 3);
    assert.equal(results.length, 3);
  });
});
