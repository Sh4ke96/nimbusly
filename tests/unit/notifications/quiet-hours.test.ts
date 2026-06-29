import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldSuppressPushForQuietHours } from "@/lib/notifications/quiet-hours";

describe("quiet hours", () => {
  it("suppresses push inside overnight window", () => {
    const night = new Date("2026-06-27T23:30:00");
    assert.equal(
      shouldSuppressPushForQuietHours({
        enabled: true,
        quietStart: "22:00",
        quietEnd: "07:00",
        now: night,
      }),
      true
    );
  });

  it("allows push outside window", () => {
    const noon = new Date("2026-06-27T12:00:00");
    assert.equal(
      shouldSuppressPushForQuietHours({
        enabled: true,
        quietStart: "22:00",
        quietEnd: "07:00",
        now: noon,
      }),
      false
    );
  });
});
