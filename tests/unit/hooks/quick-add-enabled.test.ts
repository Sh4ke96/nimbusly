import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { Profile } from "@/lib/profile";

function baseProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    first_name: "Anna",
    last_name: "Kowalska",
    avatar_color: "#000000",
    family_id: null,
    family_role: null,
    account_mode: "solo",
    onboarding_completed: true,
    ...overrides,
  };
}

describe("quick add profile preference", () => {
  it("defaults to enabled when quick_add_enabled is undefined", () => {
    useProfileStore.setState({
      profile: baseProfile(),
    });
    const profile = useProfileStore.getState().profile;
    assert.equal(profile?.quick_add_enabled !== false, true);
  });

  it("respects explicit opt-out", () => {
    useProfileStore.setState({
      profile: baseProfile({ quick_add_enabled: false }),
    });
    const profile = useProfileStore.getState().profile;
    assert.equal(profile?.quick_add_enabled !== false, false);
  });
});
