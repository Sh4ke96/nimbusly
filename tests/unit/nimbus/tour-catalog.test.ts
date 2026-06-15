import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NIMBUS_TOUR_ID } from "@/lib/constants/nimbus-tour";
import { getModuleTourIdForPath } from "@/lib/constants/nimbus-tour";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";

describe("nimbus tour catalog", () => {
  it("resolves module tour ids from paths", () => {
    assert.equal(getModuleTourIdForPath("/budget"), NIMBUS_TOUR_ID.BUDGET);
    assert.equal(getModuleTourIdForPath("/notifications"), NIMBUS_TOUR_ID.NOTIFICATIONS);
    assert.equal(getModuleTourIdForPath("/unknown"), null);
  });

  it("includes intro global search and layout steps", () => {
    const steps = getNimbusTourSteps(NIMBUS_TOUR_ID.INTRO);
    const ids = steps.map((step) => step.id);
    assert.ok(ids.includes("global-search"));
    assert.ok(ids.includes("dashboard-layout"));
  });

  it("ends module tours with a summary step", () => {
    const steps = getNimbusTourSteps(NIMBUS_TOUR_ID.BUDGET);
    const last = steps.at(-1);
    assert.equal(last?.variant, "summary");
    assert.equal(last?.id, "summary");
  });

  it("deepens budget tour with income and watch steps", () => {
    const ids = getNimbusTourSteps(NIMBUS_TOUR_ID.BUDGET).map((step) => step.id);
    assert.ok(ids.includes("income"));
    assert.ok(ids.includes("watch"));
    assert.ok(ids.includes("export"));
  });
});
