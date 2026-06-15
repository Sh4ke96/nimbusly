import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapFamilyRpcError } from "@/lib/family/rpc-errors";

const labels = {
  errorFounderMustTransfer: "transfer first",
  errorCannotRemoveFounder: "cannot remove founder",
  errorCannotDemoteFounder: "cannot demote founder",
  errorNotFamilyAdmin: "not admin",
  errorUseLeaveFamily: "use leave",
  errorAlreadyFounder: "already founder",
  errorGeneric: "generic",
} as const;

describe("mapFamilyRpcError", () => {
  it("maps founder transfer requirement", () => {
    assert.equal(
      mapFamilyRpcError("Founder must transfer ownership before leaving", labels),
      "transfer first"
    );
  });

  it("maps remove founder block", () => {
    assert.equal(
      mapFamilyRpcError("Cannot remove family founder", labels),
      "cannot remove founder"
    );
  });

  it("maps authorization errors", () => {
    assert.equal(mapFamilyRpcError("Not authorized", labels), "not admin");
    assert.equal(mapFamilyRpcError("Not in family", labels), "not admin");
  });

  it("falls back to generic error", () => {
    assert.equal(mapFamilyRpcError("Something else", labels), "generic");
  });
});
