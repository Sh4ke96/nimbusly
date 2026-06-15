import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeNoteIconEmoji, isValidNoteIconEmoji } from "@/lib/notes/emoji";

describe("normalizeNoteIconEmoji", () => {
  it("returns first grapheme", () => {
    assert.equal(normalizeNoteIconEmoji("📝✨"), "📝");
  });

  it("accepts null and empty", () => {
    assert.equal(normalizeNoteIconEmoji(null), null);
    assert.equal(isValidNoteIconEmoji(null), true);
  });
});
