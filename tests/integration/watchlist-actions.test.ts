import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WATCHLIST_MEDIA_TYPE, WATCHLIST_STATUS } from "@/lib/constants/watchlist";
import { parseWatchlistItemFromForm } from "@/lib/watchlist/types";
import { validateWatchlistFields } from "@/lib/watchlist/server/validate-fields";

describe("watchlist field validation", () => {
  it("requires title", () => {
    const parsed = parseWatchlistItemFromForm(new FormData());
    assert.equal(validateWatchlistFields(parsed), "title");
  });

  it("accepts valid parsed form", () => {
    const formData = new FormData();
    formData.set("title", "Inception");
    formData.set("mediaType", WATCHLIST_MEDIA_TYPE.MOVIE);
    formData.set("status", WATCHLIST_STATUS.TO_WATCH);
    formData.set("streamingPlatforms", "[]");

    const parsed = parseWatchlistItemFromForm(formData);
    assert.equal(validateWatchlistFields(parsed), null);
  });
});
