import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RESTAURANT_VENUE_TYPE, RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
import { parseRestaurantPlaceFromForm } from "@/lib/restaurants/types";
import { validateRestaurantFields } from "@/lib/restaurants/server/validate-fields";

describe("restaurant field validation", () => {
  it("requires name", () => {
    const parsed = parseRestaurantPlaceFromForm(new FormData());
    assert.equal(validateRestaurantFields(parsed), "name");
  });

  it("accepts valid place to visit", () => {
    const formData = new FormData();
    formData.set("name", "Pizza u Janka");
    formData.set("venueType", RESTAURANT_VENUE_TYPE.RESTAURANT);
    formData.set("visitStatus", RESTAURANT_VISIT_STATUS.PLANNED);
    formData.set("address", "ul. Testowa 1, Warszawa");

    const parsed = parseRestaurantPlaceFromForm(formData);
    assert.equal(validateRestaurantFields(parsed), null);
  });
});
