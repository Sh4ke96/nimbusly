import type { AccountMode, FamilyRole } from "@/lib/constants/account";
import type { InvitationStatus } from "@/lib/constants/family-invitation";

export type {
  AccountMode,
  FamilyRole,
  FamilySetupIntent,
} from "@/lib/constants/account";

export type { InvitationStatus } from "@/lib/constants/family-invitation";

export type FamilyInvitation = {
  id: string;
  family_id: string;
  email: string;
  status: InvitationStatus;
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
  family_role: FamilyRole | null;
  account_mode: AccountMode;
  onboarding_completed: boolean;
  dashboard_overview_layout?: unknown;
};

export type FamilyMember = Pick<
  Profile,
  "id" | "first_name" | "last_name" | "avatar_color" | "family_role"
>;

export function getDisplayName(profile: Pick<Profile, "first_name" | "last_name">) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}
