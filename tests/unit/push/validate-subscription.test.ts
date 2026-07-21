import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowsPushEndpointProtocol,
  isProductionNodeEnv,
} from "@/lib/env/node-env";
import { isValidPushSubscriptionInput } from "@/lib/push/validate-subscription";
import { getInviteCookieOptions } from "@/lib/family/invite-cookie-options";

describe("isProductionNodeEnv", () => {
  it("detects production", () => {
    assert.equal(isProductionNodeEnv("production"), true);
    assert.equal(isProductionNodeEnv("development"), false);
  });
});

describe("allowsPushEndpointProtocol", () => {
  it("requires https in production", () => {
    assert.equal(allowsPushEndpointProtocol("https:", true), true);
    assert.equal(allowsPushEndpointProtocol("http:", true), false);
  });

  it("allows http outside production", () => {
    assert.equal(allowsPushEndpointProtocol("http:", false), true);
  });
});

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
    assert.equal(
      isValidPushSubscriptionInput({
        endpoint: "http://127.0.0.1:3000/push",
        keys: validKeys,
      }),
      isProductionNodeEnv() ? false : true
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

describe("getInviteCookieOptions", () => {
  it("mirrors production env for secure flag", () => {
    assert.equal(getInviteCookieOptions().secure, isProductionNodeEnv());
  });
});
