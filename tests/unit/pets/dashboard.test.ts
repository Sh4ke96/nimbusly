import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PET_CARE_TYPE, PET_SPECIES } from "@/lib/constants/pets";
import { pickDuePetCarePreview } from "@/lib/pets/dashboard";

describe("pickDuePetCarePreview", () => {
  it("returns due care items with pet names", () => {
    const preview = pickDuePetCarePreview(
      [
        {
          id: "c1",
          pet_id: "p1",
          family_id: null,
          name: "Szczepienie",
          care_type: PET_CARE_TYPE.VACCINATION,
          last_done_at: null,
          next_due_date: "2026-06-01",
          stock_status: null,
          quantity: "",
          notes: "",
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      [
        {
          id: "p1",
          family_id: null,
          name: "Burek",
          species: PET_SPECIES.DOG,
          notes: "",
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      3
    );

    assert.equal(preview.length, 1);
    assert.equal(preview[0].petName, "Burek");
  });
});
