import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WATCHLIST_FILTER_ALL,
  WATCHLIST_MEDIA_TYPE,
  WATCHLIST_STATUS,
} from "@/lib/constants/watchlist";
import { STREAMING_PLATFORM } from "@/lib/constants/watchlist-streaming";
import {
  countWatchlistByStatus,
  filterWatchlistByMediaType,
  filterWatchlistByStatus,
  filterWatchlistByStreamingPlatform,
} from "@/lib/watchlist/filters";
import type { WatchlistItem } from "@/lib/watchlist/types";

function item(partial: Partial<WatchlistItem>): WatchlistItem {
  return {
    id: "1",
    family_id: null,
    title: "Test",
    media_type: WATCHLIST_MEDIA_TYPE.MOVIE,
    status: WATCHLIST_STATUS.TO_WATCH,
    notes: "",
    streaming_platforms: [],
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

describe("filterWatchlistByStatus", () => {
  it("filters by status key", () => {
    const items = [
      item({ id: "1", status: WATCHLIST_STATUS.TO_WATCH }),
      item({ id: "2", status: WATCHLIST_STATUS.WATCHED }),
    ];
    assert.equal(filterWatchlistByStatus(items, WATCHLIST_FILTER_ALL).length, 2);
    assert.equal(filterWatchlistByStatus(items, WATCHLIST_STATUS.WATCHED).length, 1);
  });
});

describe("filterWatchlistByMediaType", () => {
  it("filters by media type", () => {
    const items = [
      item({ id: "1", media_type: WATCHLIST_MEDIA_TYPE.MOVIE }),
      item({ id: "2", media_type: WATCHLIST_MEDIA_TYPE.SERIES }),
    ];
    assert.equal(filterWatchlistByMediaType(items, WATCHLIST_MEDIA_TYPE.SERIES).length, 1);
  });
});

describe("countWatchlistByStatus", () => {
  it("counts items per status", () => {
    const counts = countWatchlistByStatus([
      item({ status: WATCHLIST_STATUS.TO_WATCH }),
      item({ status: WATCHLIST_STATUS.TO_WATCH }),
      item({ status: WATCHLIST_STATUS.WATCHED }),
    ]);
    assert.equal(counts.all, 3);
    assert.equal(counts.to_watch, 2);
    assert.equal(counts.watched, 1);
  });
});

describe("filterWatchlistByStreamingPlatform", () => {
  it("filters items that include the selected platform", () => {
    const items = [
      item({ id: "1", streaming_platforms: [STREAMING_PLATFORM.NETFLIX] }),
      item({ id: "2", streaming_platforms: [STREAMING_PLATFORM.MAX] }),
      item({
        id: "3",
        streaming_platforms: [STREAMING_PLATFORM.NETFLIX, STREAMING_PLATFORM.MAX],
      }),
    ];
    assert.equal(filterWatchlistByStreamingPlatform(items, WATCHLIST_FILTER_ALL).length, 3);
    assert.equal(filterWatchlistByStreamingPlatform(items, STREAMING_PLATFORM.NETFLIX).length, 2);
    assert.equal(filterWatchlistByStreamingPlatform(items, STREAMING_PLATFORM.PLAYER).length, 0);
  });
});
