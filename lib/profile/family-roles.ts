import type { FamilyRole } from "@/lib/constants/account";
import { ACCOUNT_MODE, FAMILY_ROLE } from "@/lib/constants/account";
import type { Dict } from "@/lib/i18n/types";
import type { Family, Profile } from "@/lib/profile";

export type { FamilyRole };

export function isFamilyFounder(
  family: Pick<Family, "created_by"> | null | undefined,
  userId: string | undefined
): boolean {
  return !!family && !!userId && family.created_by === userId;
}

export function isFamilyAdmin(
  profile: Pick<Profile, "family_role"> | null | undefined,
  family: Pick<Family, "created_by"> | null | undefined,
  userId: string | undefined
): boolean {
  if (!profile || !userId) return false;
  if (isFamilyFounder(family, userId)) return true;
  return profile.family_role === FAMILY_ROLE.ADMIN;
}

export function canManageShoppingCategories(
  profile: Pick<Profile, "account_mode" | "family_id" | "family_role"> | null | undefined,
  family: Pick<Family, "created_by"> | null | undefined,
  userId: string | undefined
): boolean {
  if (!profile || !userId) return false;
  if (profile.account_mode === ACCOUNT_MODE.SOLO && !profile.family_id) return true;
  if (!profile.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) return false;
  return isFamilyAdmin(profile, family, userId);
}

export function familyRoleLabel(
  role: FamilyRole | null | undefined,
  labels: Pick<Dict["account"], "permissionsRoleAdmin" | "permissionsRoleMember">
): string {
  if (role === FAMILY_ROLE.ADMIN) return labels.permissionsRoleAdmin;
  return labels.permissionsRoleMember;
}
