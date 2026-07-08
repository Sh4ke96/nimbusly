import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMonthGrid,
  chunkCalendarWeeks,
  findDefaultWeekIndex,
  formatCalendarDayLabel,
  formatWeekDayRangeLabel,
  getMonthName,
  shiftMonth,
} from "@/lib/birthdays/calendar";

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

describe("chunkCalendarWeeks", () => {
  it("splits month cells into week rows", () => {
    const cells = buildMonthGrid(2026, 6);
    const weeks = chunkCalendarWeeks(cells);
    assert.equal(weeks.length, cells.length / 7);
    assert.equal(weeks.every((week) => week.length === 7), true);
  });
});

describe("findDefaultWeekIndex", () => {
  it("prefers the week containing the focused day", () => {
    const cells = buildMonthGrid(2026, 6);
    const weeks = chunkCalendarWeeks(cells);
    assert.equal(findDefaultWeekIndex(weeks, { focusDay: 15 }), 2);
  });

  it("falls back to the week containing today when possible", () => {
    const cells = buildMonthGrid(2026, 6);
    const weeks = chunkCalendarWeeks(cells);
    const today = new Date().getDate();
    const todayMonth = new Date().getMonth() + 1;
    const todayYear = new Date().getFullYear();
    if (todayYear === 2026 && todayMonth === 6) {
      const expected = weeks.findIndex((week) =>
        week.some((cell) => cell.isToday)
      );
      assert.equal(findDefaultWeekIndex(weeks), expected);
    } else {
      assert.equal(findDefaultWeekIndex(weeks), 0);
    }
  });
});

describe("formatWeekDayRangeLabel", () => {
  it("formats day ranges with month name and spaced en dash", () => {
    const cells = buildMonthGrid(2026, 6);
    const weeks = chunkCalendarWeeks(cells);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    assert.equal(formatWeekDayRangeLabel(weeks[0]!, months), "1 – 7 June");
    assert.equal(formatWeekDayRangeLabel(weeks[4]!, months), "29 – 30 June");
  });

  it("formats a single-day week without a range dash", () => {
    const week = [
      {
        date: null,
        day: null,
        month: 6,
        year: 2026,
        isCurrentMonth: false,
        isToday: false,
      },
      {
        date: new Date(2026, 5, 6),
        day: 6,
        month: 6,
        year: 2026,
        isCurrentMonth: true,
        isToday: false,
      },
    ];
    assert.equal(formatWeekDayRangeLabel(week, MONTHS), "6 Jun");
  });
});

describe("formatCalendarDayLabel", () => {
  it("combines day number and month name", () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    assert.equal(formatCalendarDayLabel(6, 6, months), "6 Jun");
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
