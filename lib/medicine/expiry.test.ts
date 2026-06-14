import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEDICINE_EXPIRY_STATUS } from "@/lib/constants/medicine";
import {
  daysUntilExpiry,
  getMedicineExpiryStatus,
  isMedicineExpiringSoon,
  sortMedicineByExpiry,
} from "@/lib/medicine/expiry";

const today = new Date(2026, 5, 14); // 2026-06-14

describe("daysUntilExpiry", () => {
  it("returns null when no expiry date", () => {
    assert.equal(daysUntilExpiry(null, today), null);
  });

  it("counts days until expiry", () => {
    assert.equal(daysUntilExpiry("2026-06-20", today), 6);
    assert.equal(daysUntilExpiry("2026-06-14", today), 0);
  });

  it("returns negative when expired", () => {
    assert.equal(daysUntilExpiry("2026-06-01", today), -13);
  });
});

describe("getMedicineExpiryStatus", () => {
  it("classifies expiry states", () => {
    assert.equal(getMedicineExpiryStatus(null, today), MEDICINE_EXPIRY_STATUS.NONE);
    assert.equal(getMedicineExpiryStatus("2027-01-01", today), MEDICINE_EXPIRY_STATUS.OK);
    assert.equal(getMedicineExpiryStatus("2026-07-01", today), MEDICINE_EXPIRY_STATUS.WARNING);
    assert.equal(getMedicineExpiryStatus("2026-06-01", today), MEDICINE_EXPIRY_STATUS.EXPIRED);
  });
});

describe("isMedicineExpiringSoon", () => {
  it("is true for warning and expired", () => {
    assert.equal(isMedicineExpiringSoon("2027-01-01", today), false);
    assert.equal(isMedicineExpiringSoon("2026-07-01", today), true);
    assert.equal(isMedicineExpiringSoon("2026-06-01", today), true);
  });
});

describe("sortMedicineByExpiry", () => {
  it("sorts by nearest expiry first, then name", () => {
    const sorted = sortMedicineByExpiry(
      [
        { expiry_date: null, name: "Zzz" },
        { expiry_date: "2026-08-01", name: "Bbb" },
        { expiry_date: "2026-06-20", name: "Aaa" },
      ],
      today
    );
    assert.deepEqual(
      sorted.map((i) => i.name),
      ["Aaa", "Bbb", "Zzz"]
    );
  });
});
