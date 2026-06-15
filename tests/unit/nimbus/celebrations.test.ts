import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tryTriggerCelebration } from "@/lib/nimbus/celebrations";

describe("tryTriggerCelebration", () => {
  it("returns false on server (no window)", () => {
    assert.equal(tryTriggerCelebration("firstChore"), false);
  });
});
