import type { AccountMode, FamilyRole } from "@/lib/constants/account";
import type { Lang } from "@/lib/constants/lang";
import type { Profile, FamilyMember } from "@/lib/profile";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type FamilyMemberRow = Pick<
  ProfileRow,
  "id" | "first_name" | "last_name" | "avatar_color" | "family_role"
>;

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_color: row.avatar_color,
    family_id: row.family_id,
    family_role: row.family_role as FamilyRole | null,
    account_mode: row.account_mode as AccountMode,
    onboarding_completed: row.onboarding_completed,
    preferred_lang: row.preferred_lang as Lang,
    dashboard_overview_layout: row.dashboard_overview_layout,
    nimbus_companion_enabled: row.nimbus_companion_enabled,
    nimbus_companion_quiet: row.nimbus_companion_quiet,
    push_notifications_enabled: row.push_notifications_enabled,
    email_digest_enabled: row.email_digest_enabled,
    notification_quiet_hours_enabled: row.notification_quiet_hours_enabled,
    notification_quiet_start: row.notification_quiet_start,
    notification_quiet_end: row.notification_quiet_end,
    weekly_digest_enabled: row.weekly_digest_enabled,
  };
}

export function mapFamilyMemberRow(row: FamilyMemberRow): FamilyMember {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_color: row.avatar_color,
    family_role: row.family_role as FamilyRole | null,
  };
}

export type FamilyInsert = Database["public"]["Tables"]["families"]["Insert"];

/** DB trigger generates invite_code when empty. */
export function familyInsertPayload(
  params: Pick<FamilyInsert, "name" | "created_by">
): FamilyInsert {
  return {
    name: params.name,
    created_by: params.created_by,
    invite_code: "",
  };
}
