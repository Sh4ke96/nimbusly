import assert from "node:assert/strict";
import { describe, it } from "node:test";
import webpush from "web-push";
import { normalizeVapidPublicKey } from "@/lib/push/normalize-vapid-public-key";

describe("normalizeVapidPublicKey", () => {
  it("accepts a generated VAPID public key", () => {
    const { publicKey } = webpush.generateVAPIDKeys();
    assert.equal(normalizeVapidPublicKey(publicKey), publicKey);
  });

  it("trims whitespace and quotes", () => {
    const { publicKey } = webpush.generateVAPIDKeys();
    assert.equal(normalizeVapidPublicKey(`  "${publicKey}"  `), publicKey);
  });

  it("rejects invalid keys", () => {
    assert.equal(normalizeVapidPublicKey("not-a-key"), null);
    assert.equal(normalizeVapidPublicKey(""), null);
  });
});
