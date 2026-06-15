import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isGiftVisibleToAllMembers,
  parseVisibleMemberIdsJson,
  serializeVisibleMemberIds,
} from "@/lib/gifts/visibility";

describe("parseVisibleMemberIdsJson", () => {
  it("treats empty input as all family", () => {
    assert.deepEqual(parseVisibleMemberIdsJson(""), []);
    assert.deepEqual(parseVisibleMemberIdsJson("[]"), []);
  });

  it("parses member id arrays", () => {
    assert.deepEqual(parseVisibleMemberIdsJson('["a","b"]'), ["a", "b"]);
  });

  it("rejects invalid payloads", () => {
    assert.equal(parseVisibleMemberIdsJson("{"), null);
    assert.equal(parseVisibleMemberIdsJson('["a",1]'), null);
  });
});

describe("serializeVisibleMemberIds", () => {
  it("round-trips member ids", () => {
    const ids = ["m1", "m2"];
    assert.deepEqual(parseVisibleMemberIdsJson(serializeVisibleMemberIds(ids)), ids);
  });
});

describe("isGiftVisibleToAllMembers", () => {
  it("detects restricted visibility", () => {
    assert.equal(isGiftVisibleToAllMembers([]), true);
    assert.equal(isGiftVisibleToAllMembers(["m1"]), false);
  });
});
