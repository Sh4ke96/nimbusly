import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MEDICINE_AVAILABILITY,
  MEDICINE_FORM_TYPE,
} from "@/lib/constants/medicine";
import {
  isValidMedicineAvailability,
  isValidMedicineExpiryDate,
  isValidMedicineFormType,
  isValidMedicineName,
  normalizeMedicineName,
  parseMedicineDateString,
} from "@/lib/medicine/types";

describe("medicine validators", () => {
  it("normalizes medicine name", () => {
    assert.equal(normalizeMedicineName("  Ibuprofen   400  "), "Ibuprofen 400");
  });

  it("validates name", () => {
    assert.equal(isValidMedicineName("Apap"), true);
    assert.equal(isValidMedicineName("   "), false);
  });

  it("validates form and availability enums", () => {
    assert.equal(isValidMedicineFormType(MEDICINE_FORM_TYPE.SYRUP), true);
    assert.equal(isValidMedicineFormType("invalid"), false);
    assert.equal(isValidMedicineAvailability(MEDICINE_AVAILABILITY.LOW), true);
    assert.equal(isValidMedicineAvailability("missing"), false);
  });

  it("parses and validates expiry dates", () => {
    const date = parseMedicineDateString("2026-12-31");
    assert.ok(date);
    assert.equal(date?.getFullYear(), 2026);
    assert.equal(isValidMedicineExpiryDate("2026-12-31"), true);
    assert.equal(isValidMedicineExpiryDate(null), true);
    assert.equal(isValidMedicineExpiryDate("not-a-date"), false);
  });
});
