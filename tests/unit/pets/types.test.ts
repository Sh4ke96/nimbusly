import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PET_CARE_TYPE,
  PET_SPECIES,
  PET_STOCK_STATUS,
} from "@/lib/constants/pets";
import {
  isValidPetCareName,
  isValidPetCareType,
  isValidPetDateString,
  isValidPetName,
  isValidPetSpecies,
  normalizePetName,
  parsePetCareItemFromForm,
  parsePetFromForm,
  validatePetCareFields,
} from "@/lib/pets/types";

describe("normalizePetName", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizePetName("  Rex   "), "Rex");
  });
});

describe("isValidPetName", () => {
  it("accepts non-empty names", () => {
    assert.equal(isValidPetName("Burek"), true);
    assert.equal(isValidPetName("   "), false);
  });
});

describe("isValidPetSpecies", () => {
  it("accepts known species", () => {
    assert.equal(isValidPetSpecies(PET_SPECIES.DOG), true);
    assert.equal(isValidPetSpecies("fish"), false);
  });
});

describe("isValidPetCareType", () => {
  it("accepts known care types", () => {
    assert.equal(isValidPetCareType(PET_CARE_TYPE.VACCINATION), true);
    assert.equal(isValidPetCareType("grooming"), false);
  });
});

describe("isValidPetDateString", () => {
  it("accepts ISO dates and empty values", () => {
    assert.equal(isValidPetDateString("2026-06-14"), true);
    assert.equal(isValidPetDateString(null), true);
    assert.equal(isValidPetDateString("14-06-2026"), false);
  });
});

describe("validatePetCareFields", () => {
  it("requires stock status for medication and food", () => {
    assert.equal(
      validatePetCareFields(PET_CARE_TYPE.MEDICATION, null),
      "stockStatus"
    );
    assert.equal(
      validatePetCareFields(PET_CARE_TYPE.VACCINATION, null),
      null
    );
    assert.equal(
      validatePetCareFields(
        PET_CARE_TYPE.FOOD,
        PET_STOCK_STATUS.IN_STOCK
      ),
      null
    );
  });
});

describe("parsePetFromForm", () => {
  it("parses pet fields from form data", () => {
    const formData = new FormData();
    formData.set("name", "  Luna ");
    formData.set("species", PET_SPECIES.CAT);
    formData.set("notes", "kot domowy");

    const parsed = parsePetFromForm(formData);
    assert.equal(parsed.name, "Luna");
    assert.equal(parsed.species, PET_SPECIES.CAT);
    assert.equal(parsed.notes, "kot domowy");
  });
});

describe("parsePetCareItemFromForm", () => {
  it("parses care item fields from form data", () => {
    const formData = new FormData();
    formData.set("petId", "pet-1");
    formData.set("name", "Szczepienie");
    formData.set("careType", PET_CARE_TYPE.VACCINATION);
    formData.set("nextDueDate", "2026-07-01");

    const parsed = parsePetCareItemFromForm(formData);
    assert.equal(parsed.petId, "pet-1");
    assert.equal(isValidPetCareName(parsed.name), true);
    assert.equal(parsed.careType, PET_CARE_TYPE.VACCINATION);
    assert.equal(parsed.nextDueDate, "2026-07-01");
  });
});
