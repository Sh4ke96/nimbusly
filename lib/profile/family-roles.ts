import type { FamilyRole } from "@/lib/constants/account";
import { FAMILY_ROLE } from "@/lib/constants/account";
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

export function familyRoleLabel(
  role: FamilyRole | null | undefined,
  labels: Pick<Dict["account"], "permissionsRoleAdmin" | "permissionsRoleMember">
): string {
  if (role === FAMILY_ROLE.ADMIN) return labels.permissionsRoleAdmin;
  return labels.permissionsRoleMember;
}
