export type AccountMode = "family" | "solo";

/** Onboarding account step: create family, join via code, or solo. */
export type FamilySetupIntent = "create" | "join" | "solo";

export type FamilyInvitation = {
  id: string;
  family_id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
  expires_at: string;
};

export type Family = {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
};

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_color: string;
  family_id: string | null;
  account_mode: AccountMode;
  onboarding_completed: boolean;
};

export type FamilyMember = Pick<
  Profile,
  "id" | "first_name" | "last_name" | "avatar_color"
>;

export function getDisplayName(profile: Pick<Profile, "first_name" | "last_name">) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}
