import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DASHBOARD_VIEW } from "@/lib/constants/dashboard";
import { buildDashboardHref } from "@/lib/dashboard/view-href";

describe("buildDashboardHref", () => {
  it("builds summary and modules URLs", () => {
    assert.equal(buildDashboardHref(DASHBOARD_VIEW.SUMMARY), "/dashboard");
    assert.equal(
      buildDashboardHref(DASHBOARD_VIEW.MODULES),
      "/dashboard?view=modules"
    );
  });
});
