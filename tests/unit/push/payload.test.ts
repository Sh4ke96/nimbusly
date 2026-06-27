import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWebPushPayload } from "@/lib/push/payload";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

describe("buildWebPushPayload", () => {
  it("defaults url to notifications page", () => {
    const payload = buildWebPushPayload({ title: "Test", body: "Body" });
    assert.equal(payload.url, PUSH_NOTIFICATION_DEFAULT_URL);
    assert.equal(payload.title, "Test");
    assert.equal(payload.body, "Body");
  });

  it("includes optional tag", () => {
    const payload = buildWebPushPayload({
      title: "A",
      body: "B",
      url: "/budget",
      tag: "budget-1",
    });
    assert.equal(payload.tag, "budget-1");
    assert.equal(payload.url, "/budget");
  });
});
