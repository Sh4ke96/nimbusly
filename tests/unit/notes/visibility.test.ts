import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isNoteVisibleToAllMembers,
  parseVisibleMemberIdsJson,
  serializeVisibleMemberIds,
} from "@/lib/notes/visibility";

describe("note visibility", () => {
  it("treats empty member ids as whole family", () => {
    assert.equal(isNoteVisibleToAllMembers([]), true);
    assert.equal(isNoteVisibleToAllMembers(["user-1"]), false);
  });

  it("round-trips member ids json", () => {
    const ids = ["a", "b"];
    assert.deepEqual(parseVisibleMemberIdsJson(serializeVisibleMemberIds(ids)), ids);
  });
});
