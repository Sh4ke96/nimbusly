import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PET_CARE_TYPE, PET_STOCK_STATUS } from "@/lib/constants/pets";
import { buildPetCareChangeSummary } from "@/lib/pets/changes";

const labels = {
  changeSummaryName: "nazwa: {from} → {to}",
  changeSummaryCareType: "typ: {from} → {to}",
  changeSummaryLastDone: "last done",
  changeSummaryNextDue: "next due",
  changeSummaryStock: "stock",
  changeSummaryQuantity: "qty",
  changeSummaryNotes: "notes",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  careTypeLabels: {
    vaccination: "Szczepienie",
    vet_visit: "Wet",
    deworming: "Odrobaczanie",
    medication: "Lek",
    food: "Karma",
    other: "Inne",
  },
  stockStatusLabels: {
    in_stock: "Jest",
    low: "Kończy się",
    out_of_stock: "Brak",
    to_buy: "Do kupienia",
  },
};

const base = {
  name: "Szczepienie",
  care_type: PET_CARE_TYPE.VACCINATION,
  last_done_at: null,
  next_due_date: "2026-07-01",
  stock_status: null,
  quantity: "",
  notes: "",
};

describe("buildPetCareChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildPetCareChangeSummary(
      base,
      { ...base, name: "Odrobaczanie" },
      labels
    );
    assert.match(summary, /nazwa:/);
  });

  it("returns empty summary when unchanged", () => {
    const summary = buildPetCareChangeSummary(base, base, labels);
    assert.equal(summary, "empty");
  });

  it("reports stock status changes", () => {
    const summary = buildPetCareChangeSummary(
      { ...base, care_type: PET_CARE_TYPE.FOOD, stock_status: PET_STOCK_STATUS.LOW },
      { ...base, care_type: PET_CARE_TYPE.FOOD, stock_status: PET_STOCK_STATUS.TO_BUY },
      labels
    );
    assert.equal(summary, "stock");
  });
});
