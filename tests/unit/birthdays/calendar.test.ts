import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMonthGrid, getMonthName, shiftMonth } from "@/lib/birthdays/calendar";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

describe("buildMonthGrid", () => {
  it("pads leading days and fills the month", () => {
    const cells = buildMonthGrid(2026, 6);
    const juneDays = cells.filter((cell) => cell.isCurrentMonth && cell.day !== null);
    assert.equal(juneDays.length, 30);
    assert.equal(cells.length % 7, 0);
  });
});

describe("shiftMonth", () => {
  it("moves across year boundaries", () => {
    assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
    assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  });
});

describe("getMonthName", () => {
  it("returns month label by index", () => {
    assert.equal(getMonthName(6, MONTHS), "Jun");
    assert.equal(getMonthName(99, MONTHS), "");
  });
});
