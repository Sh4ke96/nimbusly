import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAMILY_SETUP_INTENT } from "@/lib/constants/account";
import {
  hasInviteCodeFromRegistration,
  resolveOnboardingFamilyIntent,
} from "@/lib/family/onboarding-invite-prefill";

describe("onboarding invite prefill", () => {
  it("defaults to create without invite data", () => {
    assert.equal(resolveOnboardingFamilyIntent("", ""), FAMILY_SETUP_INTENT.CREATE);
  });

  it("selects join when invite code is present", () => {
    assert.equal(
      resolveOnboardingFamilyIntent("ABCD-1234", ""),
      FAMILY_SETUP_INTENT.JOIN
    );
  });

  it("selects join when invite token is present", () => {
    assert.equal(
      resolveOnboardingFamilyIntent("", "token-abc"),
      FAMILY_SETUP_INTENT.JOIN
    );
  });

  it("detects invite code saved during registration", () => {
    assert.equal(hasInviteCodeFromRegistration("ABCD-1234", ""), true);
    assert.equal(hasInviteCodeFromRegistration("ABCD-1234", "token"), false);
    assert.equal(hasInviteCodeFromRegistration("", ""), false);
  });
});
