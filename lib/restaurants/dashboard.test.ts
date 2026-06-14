import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESTAURANT_VENUE_TYPE,
  RESTAURANT_VISIT_STATUS,
} from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { countPlannedRestaurants, pickBestRecentRestaurants } from "@/lib/restaurants/dashboard";

function place(overrides: Partial<RestaurantPlace>): RestaurantPlace {
  return {
    id: "1",
    family_id: null,
    name: "Test",
    venue_type: RESTAURANT_VENUE_TYPE.RESTAURANT,
    visit_status: RESTAURANT_VISIT_STATUS.VISITED,
    rating: 4,
    comment: "",
    notes: "",
    address: "Warszawa",
    visited_at: "2026-01-01",
    created_by: "u1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("pickBestRecentRestaurants", () => {
  it("returns visited rated places sorted by rating then recency", () => {
    const best = pickBestRecentRestaurants([
      place({ id: "low", rating: 3, created_at: "2026-03-01T00:00:00Z" }),
      place({ id: "high-old", rating: 5, created_at: "2026-01-01T00:00:00Z" }),
      place({ id: "high-new", rating: 5, created_at: "2026-06-01T00:00:00Z" }),
      place({
        id: "planned",
        visit_status: RESTAURANT_VISIT_STATUS.PLANNED,
        rating: null,
        visited_at: null,
      }),
    ]);

    assert.deepEqual(best.map((item) => item.id), ["high-new", "high-old", "low"]);
  });

  it("limits results", () => {
    const best = pickBestRecentRestaurants(
      [
        place({ id: "1", rating: 5 }),
        place({ id: "2", rating: 4 }),
        place({ id: "3", rating: 3 }),
        place({ id: "4", rating: 2 }),
      ],
      2
    );
    assert.equal(best.length, 2);
    assert.equal(best[0].id, "1");
    assert.equal(best[1].id, "2");
  });
});

describe("countPlannedRestaurants", () => {
  it("counts planned venues only", () => {
    assert.equal(
      countPlannedRestaurants([
        place({ visit_status: RESTAURANT_VISIT_STATUS.PLANNED, rating: null, visited_at: null }),
        place({ id: "2" }),
      ]),
      1
    );
  });
});
