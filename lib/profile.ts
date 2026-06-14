export type Family = {
  id: string;
  name: string;
  created_by: string;
};

export type FamilyMember = Pick<
  Profile,
  "id" | "first_name" | "last_name" | "avatar_color"
>;

export type AccountMode = "family" | "solo";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_color: string;
  family_id: string | null;
  account_mode: AccountMode;
  onboarding_completed: boolean;
};

export function getDisplayName(profile: Pick<Profile, "first_name" | "last_name">) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}
