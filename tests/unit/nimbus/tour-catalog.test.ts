import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NIMBUS_TOUR_ID } from "@/lib/constants/nimbus-tour";
import { getModuleTourIdForPath } from "@/lib/constants/nimbus-tour";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";

describe("nimbus tour catalog", () => {
  it("resolves module tour ids from paths", () => {
    assert.equal(getModuleTourIdForPath("/budget"), NIMBUS_TOUR_ID.BUDGET);
    assert.equal(
      getModuleTourIdForPath("/calendar"),
      NIMBUS_TOUR_ID.FAMILY_CALENDAR
    );
    assert.equal(getModuleTourIdForPath("/notifications"), NIMBUS_TOUR_ID.NOTIFICATIONS);
    assert.equal(getModuleTourIdForPath("/family"), NIMBUS_TOUR_ID.FAMILY);
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

  it("deepens family tour with roles and leave steps", () => {
    const ids = getNimbusTourSteps(NIMBUS_TOUR_ID.FAMILY).map((step) => step.id);
    assert.ok(ids.includes("member-roles"));
    assert.ok(ids.includes("leave-family"));
  });

  it("solo settings tour opens account tab steps", () => {
    const ids = getNimbusTourSteps(NIMBUS_TOUR_ID.SETTINGS_SOLO).map((step) => step.id);
    assert.ok(ids.includes("account-type"));
    assert.ok(ids.includes("create-family"));
  });

  it("deepens budget tour with income and export steps", () => {
    const ids = getNimbusTourSteps(NIMBUS_TOUR_ID.BUDGET).map((step) => step.id);
    assert.ok(ids.includes("income"));
    assert.ok(!ids.includes("watch"));
    assert.ok(ids.includes("export"));
  });

  it("intro tour includes settings notifications step", () => {
    const ids = getNimbusTourSteps(NIMBUS_TOUR_ID.INTRO).map((step) => step.id);
    assert.ok(ids.includes("settings-notifications"));
    assert.ok(ids.includes("mobile-modules"));
  });
});
