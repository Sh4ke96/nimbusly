import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { daysUntilBirthday, sortBirthdaysByUpcoming } from "@/lib/dashboard/birthdays";
import type { BirthdayEntry } from "@/lib/birthdays/types";

function entry(month: number, day: number, id: string): BirthdayEntry {
  return {
    id,
    family_id: null,
    person_name: id,
    birth_month: month,
    birth_day: day,
    birth_year: null,
    description: "",
    created_by: "u1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("daysUntilBirthday", () => {
  it("counts days until the next occurrence", () => {
    const from = new Date(2026, 5, 14);
    assert.equal(daysUntilBirthday(6, 20, from), 6);
    assert.equal(daysUntilBirthday(5, 1, from), 321);
  });
});

describe("sortBirthdaysByUpcoming", () => {
  it("orders by nearest birthday first", () => {
    const from = new Date(2026, 5, 14);
    const sorted = sortBirthdaysByUpcoming(
      [entry(12, 25, "dec"), entry(6, 20, "jun"), entry(6, 15, "mid")],
      from
    );
    assert.deepEqual(sorted.map((row) => row.id), ["mid", "jun", "dec"]);
  });
});
