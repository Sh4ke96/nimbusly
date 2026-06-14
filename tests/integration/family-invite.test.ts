import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { executeValidateInviteCode } from "@/lib/family/server/validate-invite-code";
import { dict } from "@/lib/i18n";

describe("executeValidateInviteCode", () => {
  it("rejects invalid code format", async () => {
    const result = await executeValidateInviteCode(
      { t: dict.pl, supabase: {} as never },
      "bad"
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.onboarding.errorInviteCodeInvalid);
  });

  it("returns not found when rpc has no rows", async () => {
    const result = await executeValidateInviteCode(
      {
        t: dict.pl,
        supabase: {
          rpc: async () => ({ data: [], error: null }),
        } as never,
      },
      "ABCD-1234"
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.onboarding.errorInviteCodeNotFound);
  });

  it("returns family name for valid code", async () => {
    const result = await executeValidateInviteCode(
      {
        t: dict.pl,
        supabase: {
          rpc: async () => ({ data: [{ name: "Rodzina Kowalskich" }], error: null }),
        } as never,
      },
      "ABCD-1234"
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.familyName, "Rodzina Kowalskich");
  });
});
