import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMessage } from "@/lib/i18n/format";

describe("formatMessage", () => {
  it("replaces placeholders", () => {
    assert.equal(
      formatMessage("Hello {name}, you have {count} items", {
        name: "Anna",
        count: "3",
      }),
      "Hello Anna, you have 3 items"
    );
  });

  it("replaces repeated placeholders", () => {
    assert.equal(formatMessage("{x} and {x}", { x: "1" }), "1 and 1");
  });

  it("leaves unknown placeholders intact", () => {
    assert.equal(formatMessage("Hi {name}", {}), "Hi {name}");
  });
});
