import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidPushSubscriptionInput } from "@/lib/push/validate-subscription";

describe("isValidPushSubscriptionInput", () => {
  const validKeys = {
    p256dh: "a".repeat(64),
    auth: "b".repeat(32),
  };

  it("accepts https endpoints", () => {
    assert.equal(
      isValidPushSubscriptionInput({
        endpoint: "https://fcm.googleapis.com/fcm/send/example",
        keys: validKeys,
      }),
      true
    );
  });

  it("allows http endpoints outside production", () => {
    assert.notEqual(process.env.NODE_ENV, "production");

    assert.equal(
      isValidPushSubscriptionInput({
        endpoint: "http://127.0.0.1:3000/push",
        keys: validKeys,
      }),
      true
    );
  });

  it("rejects invalid endpoints and keys", () => {
    assert.equal(
      isValidPushSubscriptionInput({
        endpoint: "not-a-url",
        keys: validKeys,
      }),
      false
    );

    assert.equal(
      isValidPushSubscriptionInput({
        endpoint: "https://example.com/push",
        keys: { p256dh: "", auth: "b".repeat(32) },
      }),
      false
    );
  });
});
