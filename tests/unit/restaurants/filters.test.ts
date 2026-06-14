import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESTAURANT_FILTER_ALL,
  RESTAURANT_VENUE_TYPE,
  RESTAURANT_VISIT_STATUS,
} from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import {
  countRestaurantsByVisitStatus,
  countRestaurantsByVenueType,
  filterRestaurantsByVenueType,
  filterRestaurantsByVisitStatus,
  sortRestaurantsByVisitedAt,
} from "@/lib/restaurants/filters";

function item(overrides: Partial<RestaurantPlace>): RestaurantPlace {
  return {
    id: "1",
    family_id: null,
    name: "Test",
    venue_type: RESTAURANT_VENUE_TYPE.RESTAURANT,
    visit_status: RESTAURANT_VISIT_STATUS.PLANNED,
    rating: null,
    comment: "",
    notes: "",
    address: "Warszawa",
    visited_at: null,
    created_by: "u1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("filterRestaurantsByVisitStatus", () => {
  it("filters by visit status", () => {
    const items = [
      item({ id: "1", visit_status: RESTAURANT_VISIT_STATUS.PLANNED }),
      item({ id: "2", visit_status: RESTAURANT_VISIT_STATUS.VISITED, rating: 5, visited_at: "2026-01-01" }),
    ];
    assert.equal(filterRestaurantsByVisitStatus(items, RESTAURANT_FILTER_ALL).length, 2);
    assert.equal(filterRestaurantsByVisitStatus(items, RESTAURANT_VISIT_STATUS.VISITED).length, 1);
  });
});

describe("filterRestaurantsByVenueType", () => {
  it("filters by venue type", () => {
    const items = [
      item({ id: "1", venue_type: RESTAURANT_VENUE_TYPE.RESTAURANT }),
      item({ id: "2", venue_type: RESTAURANT_VENUE_TYPE.PUB }),
    ];
    assert.equal(filterRestaurantsByVenueType(items, RESTAURANT_VENUE_TYPE.PUB).length, 1);
  });
});

describe("countRestaurantsByVisitStatus", () => {
  it("counts items per status", () => {
    const counts = countRestaurantsByVisitStatus([
      item({ visit_status: RESTAURANT_VISIT_STATUS.PLANNED }),
      item({ visit_status: RESTAURANT_VISIT_STATUS.PLANNED }),
      item({ visit_status: RESTAURANT_VISIT_STATUS.VISITED, rating: 4, visited_at: "2026-01-01" }),
    ]);
    assert.equal(counts.planned, 2);
    assert.equal(counts.visited, 1);
  });
});

describe("countRestaurantsByVenueType", () => {
  it("counts items per venue type", () => {
    const counts = countRestaurantsByVenueType([
      item({ venue_type: RESTAURANT_VENUE_TYPE.PUB }),
      item({ venue_type: RESTAURANT_VENUE_TYPE.RESTAURANT }),
    ]);
    assert.equal(counts.pub, 1);
    assert.equal(counts.restaurant, 1);
  });
});

describe("sortRestaurantsByVisitedAt", () => {
  it("puts planned first, then visited by date desc", () => {
    const sorted = sortRestaurantsByVisitedAt([
      item({ id: "v-old", visit_status: RESTAURANT_VISIT_STATUS.VISITED, rating: 3, visited_at: "2025-01-01" }),
      item({ id: "planned", visit_status: RESTAURANT_VISIT_STATUS.PLANNED }),
      item({ id: "v-new", visit_status: RESTAURANT_VISIT_STATUS.VISITED, rating: 5, visited_at: "2026-06-01" }),
    ]);
    assert.equal(sorted[0].id, "planned");
    assert.equal(sorted[1].id, "v-new");
    assert.equal(sorted[2].id, "v-old");
  });
});
