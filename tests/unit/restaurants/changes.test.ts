import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESTAURANT_VENUE_TYPE,
  RESTAURANT_VISIT_STATUS,
} from "@/lib/constants/restaurants";
import { buildRestaurantChangeSummary } from "@/lib/restaurants/changes";

const labels = {
  changeSummaryName: "name: {from} → {to}",
  changeSummaryVenueType: "venue: {from} → {to}",
  changeSummaryVisitStatus: "status: {from} → {to}",
  changeSummaryRating: "rating changed",
  changeSummaryComment: "comment changed",
  changeSummaryNotes: "notes changed",
  changeSummaryAddress: "address changed",
  changeSummaryVisitedAt: "visited at changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  venueTypeLabels: {
    restaurant: "Restaurant",
    pub: "Pub",
  },
  visitStatusLabels: {
    planned: "Planned",
    visited: "Visited",
  },
};

const base = {
  name: "La Piazza",
  venue_type: RESTAURANT_VENUE_TYPE.RESTAURANT,
  visit_status: RESTAURANT_VISIT_STATUS.PLANNED,
  rating: null,
  comment: "",
  notes: "",
  address: "Main St 1",
  visited_at: null,
};

describe("buildRestaurantChangeSummary", () => {
  it("reports name changes", () => {
    const summary = buildRestaurantChangeSummary(
      base,
      { ...base, name: "Bistro 22" },
      labels
    );
    assert.match(summary, /name:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildRestaurantChangeSummary(base, base, labels), "empty");
  });
});
