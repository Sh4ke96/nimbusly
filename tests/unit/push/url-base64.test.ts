import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

describe("urlBase64ToUint8Array", () => {
  it("decodes a URL-safe base64 string", () => {
    const input = "QUJD"; // ABC in standard base64
    const bytes = urlBase64ToUint8Array(input);
    assert.equal(bytes.length, 3);
    assert.equal(bytes[0], 65);
    assert.equal(bytes[1], 66);
    assert.equal(bytes[2], 67);
  });
});
