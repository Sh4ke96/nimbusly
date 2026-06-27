import "../../component/setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DASHBOARD_VIEW } from "@/lib/constants/dashboard";
import {
  NIMBUS_DASHBOARD_VIEW_EVENT,
  NIMBUS_SETTINGS_TAB_EVENT,
} from "@/lib/constants/nimbus";
import { SETTINGS_TAB } from "@/lib/constants/settings";
import { NIMBUS_TOUR_PREPARE } from "@/lib/nimbus/tour-catalog";
import { prepareTourStep } from "@/lib/nimbus/tour-runtime";

describe("prepareTourStep", () => {
  it("dispatches dashboard view changes", () => {
    const views: string[] = [];
    window.addEventListener(NIMBUS_DASHBOARD_VIEW_EVENT, (event) => {
      views.push((event as CustomEvent).detail);
    });

    prepareTourStep(NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY);
    prepareTourStep(NIMBUS_TOUR_PREPARE.DASHBOARD_MODULES);

    assert.deepEqual(views, [
      DASHBOARD_VIEW.SUMMARY,
      DASHBOARD_VIEW.MODULES,
    ]);
  });

  it("dispatches settings tab changes", () => {
    const tabs: string[] = [];
    window.addEventListener(NIMBUS_SETTINGS_TAB_EVENT, (event) => {
      tabs.push((event as CustomEvent).detail);
    });

    prepareTourStep(NIMBUS_TOUR_PREPARE.SETTINGS_PROFILE);

    assert.deepEqual(tabs, [SETTINGS_TAB.PROFILE]);
  });
});
