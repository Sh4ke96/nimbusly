import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dict } from "@/lib/i18n";
import { parseAndValidateScheduleDates } from "@/lib/schedule/server/validate-schedule-dates";

describe("parseAndValidateScheduleDates", () => {
  it("rejects invalid entry date", () => {
    const result = parseAndValidateScheduleDates("", "", {
      invalidDate: dict.pl.schedule.errorInvalidDate,
      endBeforeStart: dict.pl.schedule.errorEndBeforeStart,
    });
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.schedule.errorInvalidDate);
  });

  it("rejects end date before start", () => {
    const result = parseAndValidateScheduleDates("2026-06-20", "2026-06-10", {
      invalidDate: dict.pl.schedule.errorInvalidDate,
      endBeforeStart: dict.pl.schedule.errorEndBeforeStart,
    });
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.schedule.errorEndBeforeStart);
  });

  it("accepts valid single-day entry", () => {
    const result = parseAndValidateScheduleDates("2026-06-20", "2026-06-20", {
      invalidDate: dict.pl.schedule.errorInvalidDate,
      endBeforeStart: dict.pl.schedule.errorEndBeforeStart,
    });
    assert.ok(result && "entryDate" in result);
    assert.equal(result.entryDate, "2026-06-20");
    assert.equal(result.entryEndDate, null);
  });
});
