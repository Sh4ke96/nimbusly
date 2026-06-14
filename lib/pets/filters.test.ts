import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PET_CARE_TYPE,
  PET_FILTER_ALL,
  PET_SPECIES,
} from "@/lib/constants/pets";
import {
  countDuePetCareItems,
  countPetCareByType,
  filterPetCareByPet,
  filterPetCareByType,
  resolvePetName,
} from "@/lib/pets/filters";
import type { Pet, PetCareItem } from "@/lib/pets/types";

function care(partial: Partial<PetCareItem>): PetCareItem {
  return {
    id: "1",
    pet_id: "pet-1",
    family_id: null,
    name: "Szczepienie",
    care_type: PET_CARE_TYPE.VACCINATION,
    last_done_at: null,
    next_due_date: null,
    stock_status: null,
    quantity: "",
    notes: "",
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("filterPetCareByPet", () => {
  it("filters by pet id", () => {
    const items = [care({ id: "1", pet_id: "pet-1" }), care({ id: "2", pet_id: "pet-2" })];
    assert.equal(filterPetCareByPet(items, PET_FILTER_ALL).length, 2);
    assert.equal(filterPetCareByPet(items, "pet-2").length, 1);
  });
});

describe("filterPetCareByType", () => {
  it("filters by care type", () => {
    const items = [
      care({ care_type: PET_CARE_TYPE.VACCINATION }),
      care({ id: "2", care_type: PET_CARE_TYPE.FOOD }),
    ];
    assert.equal(filterPetCareByType(items, PET_CARE_TYPE.FOOD).length, 1);
  });
});

describe("countPetCareByType", () => {
  it("counts items per type", () => {
    const counts = countPetCareByType([
      care({ care_type: PET_CARE_TYPE.VACCINATION }),
      care({ id: "2", care_type: PET_CARE_TYPE.VACCINATION }),
      care({ id: "3", care_type: PET_CARE_TYPE.FOOD }),
    ]);
    assert.equal(counts.all, 3);
    assert.equal(counts.vaccination, 2);
    assert.equal(counts.food, 1);
  });
});

describe("countDuePetCareItems", () => {
  it("counts items due soon", () => {
    const count = countDuePetCareItems([
      care({ next_due_date: "2026-06-01" }),
      care({ id: "2", next_due_date: "2099-12-01" }),
    ]);
    assert.ok(count >= 1);
  });
});

describe("resolvePetName", () => {
  it("returns pet name by id", () => {
    const pets: Pet[] = [
      {
        id: "pet-1",
        family_id: null,
        name: "Burek",
        species: PET_SPECIES.DOG,
        notes: "",
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];
    assert.equal(resolvePetName(pets, "pet-1"), "Burek");
    assert.equal(resolvePetName(pets, "missing"), "");
  });
});
