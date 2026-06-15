import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STREAMING_PLATFORM } from "@/lib/constants/watchlist-streaming";
import {
  normalizeStreamingPlatforms,
  parseStreamingPlatformsJson,
  streamingPlatformsEqual,
} from "@/lib/watchlist/streaming-platforms";

describe("watchlist streaming platforms", () => {
  it("normalizes and deduplicates platforms in stable order", () => {
    assert.deepEqual(
      normalizeStreamingPlatforms([
        STREAMING_PLATFORM.PLAYER,
        "invalid",
        STREAMING_PLATFORM.NETFLIX,
        STREAMING_PLATFORM.NETFLIX,
      ]),
      [STREAMING_PLATFORM.NETFLIX, STREAMING_PLATFORM.PLAYER]
    );
  });

  it("parses JSON platform lists", () => {
    assert.deepEqual(
      parseStreamingPlatformsJson(
        JSON.stringify([STREAMING_PLATFORM.MAX, STREAMING_PLATFORM.DISNEY_PLUS])
      ),
      [STREAMING_PLATFORM.MAX, STREAMING_PLATFORM.DISNEY_PLUS]
    );
    assert.equal(parseStreamingPlatformsJson("not-json"), null);
  });

  it("compares platform lists", () => {
    assert.equal(
      streamingPlatformsEqual(
        [STREAMING_PLATFORM.NETFLIX],
        [STREAMING_PLATFORM.NETFLIX]
      ),
      true
    );
    assert.equal(
      streamingPlatformsEqual(
        [STREAMING_PLATFORM.NETFLIX],
        [STREAMING_PLATFORM.MAX]
      ),
      false
    );
  });
});
