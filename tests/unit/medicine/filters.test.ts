import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEDICINE_AVAILABILITY, MEDICINE_FILTER_ALL } from "@/lib/constants/medicine";
import {
  countMedicineByAvailability,
  filterMedicineByAvailability,
} from "@/lib/medicine/filters";
import type { MedicineItem } from "@/lib/medicine/types";

function item(partial: Partial<MedicineItem>): MedicineItem {
  return {
    id: "1",
    family_id: null,
    name: "Apap",
    form_type: "tablets",
    quantity: "",
    expiry_date: null,
    availability: MEDICINE_AVAILABILITY.IN_STOCK,
    location: "",
    notes: "",
    taken_by: null,
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("filterMedicineByAvailability", () => {
  it("filters by availability", () => {
    const items = [
      item({ id: "1", availability: MEDICINE_AVAILABILITY.IN_STOCK }),
      item({ id: "2", availability: MEDICINE_AVAILABILITY.TO_BUY }),
    ];
    assert.equal(filterMedicineByAvailability(items, MEDICINE_FILTER_ALL).length, 2);
    assert.equal(
      filterMedicineByAvailability(items, MEDICINE_AVAILABILITY.TO_BUY).length,
      1
    );
  });
});

describe("countMedicineByAvailability", () => {
  it("counts per availability", () => {
    const counts = countMedicineByAvailability([
      item({ availability: MEDICINE_AVAILABILITY.LOW }),
      item({ id: "2", availability: MEDICINE_AVAILABILITY.LOW }),
      item({ id: "3", availability: MEDICINE_AVAILABILITY.TO_BUY }),
    ]);
    assert.equal(counts.all, 3);
    assert.equal(counts.low, 2);
    assert.equal(counts.to_buy, 1);
  });
});
