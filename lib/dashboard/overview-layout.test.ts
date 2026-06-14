import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DASHBOARD_OVERVIEW_CARD } from "@/lib/constants/dashboard-overview";
import {
  getVisibleOverviewCardIds,
  normalizeDashboardOverviewLayout,
  parseDashboardOverviewLayout,
  reorderOverviewCards,
  setOverviewCardHidden,
} from "@/lib/dashboard/overview-layout";

describe("parseDashboardOverviewLayout", () => {
  it("returns defaults for invalid input", () => {
    const layout = parseDashboardOverviewLayout(null);
    assert.ok(layout.order.includes(DASHBOARD_OVERVIEW_CARD.BUDGET));
    assert.deepEqual(layout.hidden, []);
  });

  it("merges unknown and missing cards into order", () => {
    const layout = parseDashboardOverviewLayout({
      order: [DASHBOARD_OVERVIEW_CARD.GIFTS, DASHBOARD_OVERVIEW_CARD.BUDGET],
      hidden: [DASHBOARD_OVERVIEW_CARD.SHOPPING],
    });
    assert.equal(layout.order[0], DASHBOARD_OVERVIEW_CARD.GIFTS);
    assert.equal(layout.order[1], DASHBOARD_OVERVIEW_CARD.BUDGET);
    assert.ok(layout.order.includes(DASHBOARD_OVERVIEW_CARD.FAMILY));
    assert.deepEqual(layout.hidden, [DASHBOARD_OVERVIEW_CARD.SHOPPING]);
  });
});

describe("getVisibleOverviewCardIds", () => {
  it("excludes hidden cards", () => {
    const visible = getVisibleOverviewCardIds(
      normalizeDashboardOverviewLayout({
        order: [
          DASHBOARD_OVERVIEW_CARD.BUDGET,
          DASHBOARD_OVERVIEW_CARD.SHOPPING,
          DASHBOARD_OVERVIEW_CARD.GIFTS,
        ],
        hidden: [DASHBOARD_OVERVIEW_CARD.SHOPPING],
      })
    );
    assert.equal(visible.includes(DASHBOARD_OVERVIEW_CARD.SHOPPING), false);
    assert.equal(visible.includes(DASHBOARD_OVERVIEW_CARD.BUDGET), true);
    assert.equal(visible.includes(DASHBOARD_OVERVIEW_CARD.GIFTS), true);
  });
});

describe("reorderOverviewCards", () => {
  it("reorders visible cards while keeping hidden cards out of view", () => {
    const initial = normalizeDashboardOverviewLayout({
      order: [
        DASHBOARD_OVERVIEW_CARD.BUDGET,
        DASHBOARD_OVERVIEW_CARD.SHOPPING,
        DASHBOARD_OVERVIEW_CARD.GIFTS,
      ],
      hidden: [DASHBOARD_OVERVIEW_CARD.SHOPPING],
    });

    const next = reorderOverviewCards(
      initial,
      DASHBOARD_OVERVIEW_CARD.GIFTS,
      DASHBOARD_OVERVIEW_CARD.BUDGET
    );

    const visible = getVisibleOverviewCardIds(next);
    assert.equal(visible.indexOf(DASHBOARD_OVERVIEW_CARD.GIFTS), 0);
    assert.equal(visible.indexOf(DASHBOARD_OVERVIEW_CARD.BUDGET), 1);
    assert.deepEqual(next.hidden, [DASHBOARD_OVERVIEW_CARD.SHOPPING]);
  });
});

describe("setOverviewCardHidden", () => {
  it("toggles hidden state", () => {
    const initial = parseDashboardOverviewLayout({});
    const hidden = setOverviewCardHidden(
      initial,
      DASHBOARD_OVERVIEW_CARD.CALENDAR,
      true
    );
    assert.ok(hidden.hidden.includes(DASHBOARD_OVERVIEW_CARD.CALENDAR));

    const shown = setOverviewCardHidden(
      hidden,
      DASHBOARD_OVERVIEW_CARD.CALENDAR,
      false
    );
    assert.equal(shown.hidden.includes(DASHBOARD_OVERVIEW_CARD.CALENDAR), false);
  });
});
