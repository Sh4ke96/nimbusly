import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

describe("dedupeAsync", () => {
  it("reuses the in-flight promise for the same key", async () => {
    let runs = 0;
    const first = dedupeAsync("test:key", async () => {
      runs += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "ok";
    });
    const second = dedupeAsync("test:key", async () => {
      runs += 1;
      return "other";
    });

    const [a, b] = await Promise.all([first, second]);
    assert.equal(a, "ok");
    assert.equal(b, "ok");
    assert.equal(runs, 1);
  });

  it("allows a new call after the prior promise settles", async () => {
    let runs = 0;
    await dedupeAsync("test:reset", async () => {
      runs += 1;
    });
    await dedupeAsync("test:reset", async () => {
      runs += 1;
    });
    assert.equal(runs, 2);
  });
});
