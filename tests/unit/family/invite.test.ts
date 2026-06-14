import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFamilyInviteRegisterUrl,
  formatInviteCode,
  isValidInviteCodeFormat,
  normalizeInviteCode,
} from "@/lib/family/invite";

describe("family invite helpers", () => {
  it("normalizes invite codes", () => {
    assert.equal(normalizeInviteCode(" abcd-1234 "), "ABCD1234");
    assert.equal(normalizeInviteCode("ABCD 1234"), "ABCD1234");
  });

  it("formats invite codes for display", () => {
    assert.equal(formatInviteCode("abcd1234"), "ABCD-1234");
    assert.equal(formatInviteCode("ABCD-1234"), "ABCD-1234");
  });

  it("validates invite code length", () => {
    assert.equal(isValidInviteCodeFormat("ABCD-1234"), true);
    assert.equal(isValidInviteCodeFormat("ABC"), false);
  });

  it("builds register URLs with invite token", () => {
    const url = buildFamilyInviteRegisterUrl("http://localhost:3000", "token123");
    assert.equal(url, "http://localhost:3000/register?invite=token123");
  });
});
