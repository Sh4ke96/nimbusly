import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NIMBUS_TOUR_ID, NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import {
  buildNimbusDriverSteps,
  getNimbusDriverStepData,
} from "@/lib/nimbus/build-driver-steps";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import { nimbusTourMessagesEn } from "@/lib/i18n/nimbus-messages";

describe("buildNimbusDriverSteps", () => {
  it("maps catalog steps to driver selectors and copy", () => {
    const catalog = getNimbusTourSteps(NIMBUS_TOUR_ID.BUDGET);
    const driverSteps = buildNimbusDriverSteps(
      catalog,
      { nimbusTour: nimbusTourMessagesEn } as never,
      "Missing target"
    );

    assert.ok(driverSteps.length > 0);
    const first = driverSteps[0];
    assert.match(String(first.element), /data-nimbus-tour/);

    const meta = getNimbusDriverStepData(first);
    assert.equal(meta?.step.id, catalog[0]?.id);
    assert.equal(meta?.targetMissingLabel, "Missing target");
  });

  it("uses centered popover for summary steps", () => {
    const catalog = getNimbusTourSteps(NIMBUS_TOUR_ID.BUDGET);
    const summary = catalog.at(-1);
    assert.equal(summary?.variant, "summary");

    const driverSteps = buildNimbusDriverSteps(
      catalog,
      { nimbusTour: nimbusTourMessagesEn } as never,
      "Missing target"
    );
    const summaryStep = driverSteps.at(-1);

    assert.equal(summaryStep?.element, undefined);
    assert.equal(summaryStep?.popover?.side, undefined);
    assert.equal(
      summaryStep?.popover?.popoverClass,
      "nimbus-driver-popover-summary"
    );
    assert.equal(
      getNimbusDriverStepData(summaryStep!)?.step.target,
      NIMBUS_TOUR_TARGET.TOUR_SUMMARY
    );
  });

  it("attaches nimbus metadata on every driver step", () => {
    const catalog = getNimbusTourSteps(NIMBUS_TOUR_ID.INTRO);
    const driverSteps = buildNimbusDriverSteps(
      catalog,
      { nimbusTour: nimbusTourMessagesEn } as never,
      "Target not found"
    );

    assert.equal(driverSteps.length, catalog.length);
    for (let index = 0; index < driverSteps.length; index += 1) {
      const meta = getNimbusDriverStepData(driverSteps[index]!);
      assert.equal(meta?.step.id, catalog[index]?.id);
      assert.equal(meta?.targetMissingLabel, "Target not found");
    }
  });
});
