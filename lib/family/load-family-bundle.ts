import type { SupabaseClient } from "@supabase/supabase-js";
import { INVITATION_STATUS } from "@/lib/constants/family-invitation";
import type { Family, FamilyInvitation, FamilyMember } from "@/lib/profile";
import { mapFamilyMemberRow } from "@/lib/supabase/row-mappers";

export async function loadFamilyBundle(
  supabase: SupabaseClient,
  familyId: string,
  userId: string,
  isFamilyAccount: boolean
): Promise<{
  family: Family | null;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
}> {
  const [{ data: family }, { data: members }] = await Promise.all([
    supabase
      .from("families")
      .select("id, name, created_by, invite_code")
      .eq("id", familyId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_color, family_role")
      .eq("family_id", familyId),
  ]);

  let invitations: FamilyInvitation[] = [];
  if (isFamilyAccount && family?.created_by === userId) {
    const { data } = await supabase
      .from("family_invitations")
      .select("id, family_id, email, status, created_at, expires_at")
      .eq("family_id", familyId)
      .eq("status", INVITATION_STATUS.PENDING)
      .order("created_at", { ascending: false });
    invitations = (data ?? []) as FamilyInvitation[];
  }

  return {
    family: family ?? null,
    members: (members ?? []).map(mapFamilyMemberRow),
    invitations,
  };
}
