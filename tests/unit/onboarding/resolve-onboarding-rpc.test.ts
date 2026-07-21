import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAMILY_SETUP_INTENT } from "@/lib/constants/account";
import { resolveOnboardingRpc } from "@/lib/onboarding/resolve-onboarding-rpc";

const baseInput = {
  firstName: "Ada",
  lastName: "Lovelace",
  avatarColor: "sky",
  familyName: null as string | null,
  inviteToken: "",
  inviteCode: "",
};

describe("resolveOnboardingRpc", () => {
  it("selects solo onboarding", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.SOLO,
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.call.rpc, "complete_solo_onboarding");
  });

  it("selects atomic founder onboarding", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.CREATE,
      familyName: "Lovelace Family",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.call.rpc, "onboard_create_family");
    assert.equal(result.call.args.p_family_name, "Lovelace Family");
  });

  it("requires family name for create intent", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.CREATE,
      familyName: "",
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "missing_family_name");
  });

  it("selects invitation token onboarding", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.JOIN,
      inviteToken: "token-123",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.call.rpc, "onboard_with_invitation_token");
    assert.equal(result.call.args.p_token, "token-123");
  });

  it("selects invite code onboarding with normalization", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.JOIN,
      inviteCode: "abcd 1234",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.call.rpc, "onboard_with_invite_code");
    assert.equal(result.call.args.p_code, "ABCD1234");
  });

  it("rejects invalid invite code", () => {
    const result = resolveOnboardingRpc({
      ...baseInput,
      familyIntent: FAMILY_SETUP_INTENT.JOIN,
      inviteCode: "bad",
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "invalid_invite_code");
  });
});
