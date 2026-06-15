import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatGiftLinkLabel,
  isValidGiftLinkUrl,
  normalizeGiftLinkUrl,
} from "@/lib/gifts/url";

describe("normalizeGiftLinkUrl", () => {
  it("adds https scheme when missing", () => {
    assert.equal(normalizeGiftLinkUrl("example.com/gift"), "https://example.com/gift");
  });

  it("returns empty string for blank input", () => {
    assert.equal(normalizeGiftLinkUrl("   "), "");
  });
});

describe("isValidGiftLinkUrl", () => {
  it("accepts empty optional links", () => {
    assert.equal(isValidGiftLinkUrl(""), true);
  });

  it("accepts http and https links", () => {
    assert.equal(isValidGiftLinkUrl("https://shop.pl/item"), true);
    assert.equal(isValidGiftLinkUrl("http://shop.pl/item"), true);
  });

  it("rejects invalid urls", () => {
    assert.equal(isValidGiftLinkUrl("not a url"), false);
  });
});

describe("formatGiftLinkLabel", () => {
  it("returns hostname without www", () => {
    assert.equal(formatGiftLinkLabel("https://www.allegro.pl/oferta"), "allegro.pl");
  });
});
