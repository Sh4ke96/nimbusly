import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESTAURANT_VENUE_TYPE,
  RESTAURANT_VISIT_STATUS,
} from "@/lib/constants/restaurants";
import { buildGoogleMapsEmbedUrl, buildGoogleMapsOpenUrl } from "@/lib/restaurants/maps";
import {
  isValidRestaurantAddress,
  isValidRestaurantName,
  isValidRestaurantRating,
  isValidRestaurantVisitStatus,
  normalizeRestaurantName,
  parseRestaurantDateString,
  validateRestaurantVisitFields,
} from "@/lib/restaurants/types";

describe("normalizeRestaurantName", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeRestaurantName("  Foo   Bar  "), "Foo Bar");
  });
});

describe("restaurant validators", () => {
  it("validates name", () => {
    assert.equal(isValidRestaurantName("U Fukiera"), true);
    assert.equal(isValidRestaurantName(""), false);
  });

  it("validates address", () => {
    assert.equal(isValidRestaurantAddress("ul. Krakowskie Przedmieście 1"), true);
    assert.equal(isValidRestaurantAddress(""), false);
  });

  it("validates rating", () => {
    assert.equal(isValidRestaurantRating(3), true);
    assert.equal(isValidRestaurantRating(null), true);
    assert.equal(isValidRestaurantRating(0), false);
    assert.equal(isValidRestaurantRating(6), false);
  });

  it("validates visit status", () => {
    assert.equal(isValidRestaurantVisitStatus(RESTAURANT_VISIT_STATUS.VISITED), true);
    assert.equal(isValidRestaurantVisitStatus("unknown"), false);
  });

  it("parses restaurant dates", () => {
    const date = parseRestaurantDateString("2026-03-15");
    assert.ok(date);
    assert.equal(date?.getFullYear(), 2026);
  });

  it("requires rating and date when visited", () => {
    assert.equal(
      validateRestaurantVisitFields(RESTAURANT_VISIT_STATUS.VISITED, 4, "2026-01-01"),
      null
    );
    assert.equal(
      validateRestaurantVisitFields(RESTAURANT_VISIT_STATUS.VISITED, null, "2026-01-01"),
      "rating"
    );
    assert.equal(
      validateRestaurantVisitFields(RESTAURANT_VISIT_STATUS.VISITED, 4, null),
      "visitedAt"
    );
    assert.equal(
      validateRestaurantVisitFields(RESTAURANT_VISIT_STATUS.PLANNED, null, null),
      null
    );
  });
});

describe("google maps urls", () => {
  it("builds embed and open urls", () => {
    const address = "Warszawa, ul. Nowy Świat 1";
    assert.ok(buildGoogleMapsEmbedUrl(address)?.includes(encodeURIComponent(address)));
    assert.ok(buildGoogleMapsOpenUrl(address)?.includes(encodeURIComponent(address)));
  });

  it("returns null for empty address", () => {
    assert.equal(buildGoogleMapsEmbedUrl("  "), null);
  });
});
