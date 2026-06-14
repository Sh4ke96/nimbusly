import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WATCHLIST_MEDIA_TYPE,
  WATCHLIST_STATUS,
} from "@/lib/constants/watchlist";
import { buildWatchlistChangeSummary } from "@/lib/watchlist/changes";

const labels = {
  changeSummaryTitle: "title: {from} → {to}",
  changeSummaryMediaType: "type: {from} → {to}",
  changeSummaryStatus: "status: {from} → {to}",
  changeSummaryNotes: "notes changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  mediaTypeLabels: {
    movie: "Movie",
    series: "Series",
  },
  statusLabels: {
    to_watch: "To watch",
    watching: "Watching",
    watched: "Watched",
  },
};

const base = {
  title: "Dune",
  media_type: WATCHLIST_MEDIA_TYPE.MOVIE,
  status: WATCHLIST_STATUS.TO_WATCH,
  notes: "",
};

describe("buildWatchlistChangeSummary", () => {
  it("reports title changes", () => {
    const summary = buildWatchlistChangeSummary(
      base,
      { ...base, title: "Dune: Part Two" },
      labels
    );
    assert.match(summary, /title:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildWatchlistChangeSummary(base, base, labels), "empty");
  });
});
