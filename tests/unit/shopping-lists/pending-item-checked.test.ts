import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  clearPendingItemChecked,
  getPendingItemChecked,
  resetPendingItemChecked,
  setPendingItemChecked,
} from "@/lib/shopping-lists/pending-item-checked";

describe("pending-item-checked", () => {
  afterEach(() => {
    resetPendingItemChecked();
  });

  it("tracks and clears pending checked state per item", () => {
    assert.equal(getPendingItemChecked("item-1"), undefined);

    setPendingItemChecked("item-1", true);
    assert.equal(getPendingItemChecked("item-1"), true);

    clearPendingItemChecked("item-1");
    assert.equal(getPendingItemChecked("item-1"), undefined);
  });

  it("reset clears all pending checked entries", () => {
    setPendingItemChecked("item-1", true);
    setPendingItemChecked("item-2", false);

    resetPendingItemChecked();

    assert.equal(getPendingItemChecked("item-1"), undefined);
    assert.equal(getPendingItemChecked("item-2"), undefined);
  });
});
