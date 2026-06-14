import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEDULE_ENTRY_TYPE } from "@/lib/constants/schedule";
import {
  dateToEntryDateString,
  isValidEntryDateString,
  isValidScheduleEntryType,
  countScheduleEntriesOnDate,
  isScheduleDayFull,
  scheduleDateKey,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { SCHEDULE_MAX_ENTRIES_PER_DAY } from "@/lib/constants/schedule";

describe("isValidScheduleEntryType", () => {
  it("accepts known types", () => {
    assert.equal(isValidScheduleEntryType(SCHEDULE_ENTRY_TYPE.WORK), true);
    assert.equal(isValidScheduleEntryType(SCHEDULE_ENTRY_TYPE.TRIP), true);
  });

  it("rejects unknown types", () => {
    assert.equal(isValidScheduleEntryType("vacation"), false);
    assert.equal(isValidScheduleEntryType(""), false);
  });
});

describe("isValidEntryDateString", () => {
  it("validates real calendar dates", () => {
    assert.equal(isValidEntryDateString("2026-06-14"), true);
    assert.equal(isValidEntryDateString("2026-02-29"), false);
  });

  it("rejects malformed strings", () => {
    assert.equal(isValidEntryDateString("14-06-2026"), false);
    assert.equal(isValidEntryDateString("2026-13-01"), false);
  });
});

describe("scheduleDateKey", () => {
  it("zero-pads month and day", () => {
    assert.equal(scheduleDateKey(2026, 3, 5), "2026-03-05");
  });
});

describe("dateToEntryDateString", () => {
  it("formats Date to ISO date", () => {
    assert.equal(dateToEntryDateString(new Date(2026, 5, 14)), "2026-06-14");
  });
});

describe("countScheduleEntriesOnDate", () => {
  const sampleEntries: ScheduleEntry[] = [
    {
      id: "a",
      family_id: null,
      entry_date: "2026-06-14",
      entry_type: SCHEDULE_ENTRY_TYPE.WORK,
      description: "",
      created_by: "u1",
      created_at: "",
      updated_at: "",
    },
    {
      id: "b",
      family_id: null,
      entry_date: "2026-06-14",
      entry_type: SCHEDULE_ENTRY_TYPE.FREE,
      description: "",
      created_by: "u1",
      created_at: "",
      updated_at: "",
    },
    {
      id: "c",
      family_id: null,
      entry_date: "2026-06-15",
      entry_type: SCHEDULE_ENTRY_TYPE.TRIP,
      description: "",
      created_by: "u1",
      created_at: "",
      updated_at: "",
    },
  ];

  it("counts entries on the same date", () => {
    assert.equal(countScheduleEntriesOnDate(sampleEntries, "2026-06-14"), 2);
    assert.equal(countScheduleEntriesOnDate(sampleEntries, "2026-06-15"), 1);
  });

  it("excludes entry by id when updating", () => {
    assert.equal(countScheduleEntriesOnDate(sampleEntries, "2026-06-14", "a"), 1);
  });
});

describe("isScheduleDayFull", () => {
  it(`is false below ${SCHEDULE_MAX_ENTRIES_PER_DAY} entries and true at the limit`, () => {
    const entries: ScheduleEntry[] = Array.from({ length: 3 }, (_, index) => ({
      id: String(index),
      family_id: null,
      entry_date: "2026-06-14",
      entry_type: SCHEDULE_ENTRY_TYPE.WORK,
      description: "",
      created_by: "u1",
      created_at: "",
      updated_at: "",
    }));

    assert.equal(isScheduleDayFull(entries.slice(0, 2), "2026-06-14"), false);
    assert.equal(isScheduleDayFull(entries, "2026-06-14"), true);
    assert.equal(isScheduleDayFull(entries, "2026-06-14", "0"), false);
  });
});
