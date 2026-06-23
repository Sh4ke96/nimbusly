import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidGiftContent } from "@/lib/gifts/types";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { isValidGiftRecipientType } from "@/lib/gifts/types";

describe("gift idea validation", () => {
  it("requires non-empty content", () => {
    assert.equal(isValidGiftContent(""), false);
    assert.equal(isValidGiftContent("  "), false);
    assert.equal(isValidGiftContent("Książka o gotowaniu"), true);
  });

  it("accepts valid recipient types", () => {
    assert.equal(isValidGiftRecipientType(GIFT_RECIPIENT_TYPE.CUSTOM), true);
    assert.equal(isValidGiftRecipientType(GIFT_RECIPIENT_TYPE.FAMILY_MEMBER), true);
    assert.equal(isValidGiftRecipientType("invalid"), false);
  });
});
