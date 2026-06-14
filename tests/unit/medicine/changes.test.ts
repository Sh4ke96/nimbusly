import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MEDICINE_AVAILABILITY,
  MEDICINE_FORM_TYPE,
} from "@/lib/constants/medicine";
import { buildMedicineChangeSummary } from "@/lib/medicine/changes";

const labels = {
  changeSummaryName: "name: {from} → {to}",
  changeSummaryForm: "form: {from} → {to}",
  changeSummaryQuantity: "quantity changed",
  changeSummaryExpiry: "expiry changed",
  changeSummaryAvailability: "availability: {from} → {to}",
  changeSummaryLocation: "location changed",
  changeSummaryNotes: "notes changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  formLabels: {
    tablets: "Tablets",
    syrup: "Syrup",
    drops: "Drops",
    cream: "Cream",
    patch: "Patch",
    spray: "Spray",
    other: "Other",
  },
  availabilityLabels: {
    in_stock: "In stock",
    low: "Low",
    out_of_stock: "Out of stock",
    to_buy: "To buy",
  },
};

const base = {
  name: "Ibuprofen",
  form_type: MEDICINE_FORM_TYPE.TABLETS,
  quantity: "20",
  expiry_date: "2027-01-01",
  availability: MEDICINE_AVAILABILITY.IN_STOCK,
  location: "Cabinet",
  notes: "",
};

describe("buildMedicineChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildMedicineChangeSummary(
      base,
      { ...base, name: "Paracetamol" },
      labels
    );
    assert.match(summary, /name:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildMedicineChangeSummary(base, base, labels), "empty");
  });
});
