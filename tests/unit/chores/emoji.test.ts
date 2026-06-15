import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidChoreIconEmoji, normalizeChoreIconEmoji } from "@/lib/chores/emoji";

describe("normalizeChoreIconEmoji", () => {
  it("keeps a single emoji", () => {
    assert.equal(normalizeChoreIconEmoji("🗑️"), "🗑️");
  });

  it("takes only the first emoji from pasted text", () => {
    assert.equal(normalizeChoreIconEmoji("🧹 extra"), "🧹");
  });

  it("returns null for empty values", () => {
    assert.equal(normalizeChoreIconEmoji(""), null);
    assert.equal(normalizeChoreIconEmoji(null), null);
  });
});

describe("isValidChoreIconEmoji", () => {
  it("accepts empty and valid emoji", () => {
    assert.equal(isValidChoreIconEmoji(null), true);
    assert.equal(isValidChoreIconEmoji("🧺"), true);
  });
});
