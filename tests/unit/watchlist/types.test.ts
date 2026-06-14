import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WATCHLIST_MEDIA_TYPE,
  WATCHLIST_STATUS,
} from "@/lib/constants/watchlist";
import {
  isValidWatchlistMediaType,
  isValidWatchlistNotes,
  isValidWatchlistStatus,
  isValidWatchlistTitle,
  normalizeWatchlistTitle,
} from "@/lib/watchlist/types";

describe("watchlist validators", () => {
  it("normalizes title", () => {
    assert.equal(normalizeWatchlistTitle("  Inception   2010  "), "Inception 2010");
  });

  it("validates title", () => {
    assert.equal(isValidWatchlistTitle("Breaking Bad"), true);
    assert.equal(isValidWatchlistTitle("   "), false);
  });

  it("validates media type and status", () => {
    assert.equal(isValidWatchlistMediaType(WATCHLIST_MEDIA_TYPE.MOVIE), true);
    assert.equal(isValidWatchlistMediaType("podcast"), false);
    assert.equal(isValidWatchlistStatus(WATCHLIST_STATUS.WATCHING), true);
    assert.equal(isValidWatchlistStatus("paused"), false);
  });

  it("validates notes length", () => {
    assert.equal(isValidWatchlistNotes("sezon 2"), true);
    assert.equal(isValidWatchlistNotes("x".repeat(501)), false);
  });
});
