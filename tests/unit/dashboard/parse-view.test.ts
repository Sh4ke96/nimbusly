import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DASHBOARD_VIEW } from "@/lib/constants/dashboard";
import { parseDashboardView } from "@/lib/dashboard/parse-view";

describe("parseDashboardView", () => {
  it("defaults to summary", () => {
    assert.equal(parseDashboardView(null), DASHBOARD_VIEW.SUMMARY);
    assert.equal(parseDashboardView("invalid"), DASHBOARD_VIEW.SUMMARY);
  });

  it("parses modules view", () => {
    assert.equal(parseDashboardView(DASHBOARD_VIEW.MODULES), DASHBOARD_VIEW.MODULES);
  });
});
