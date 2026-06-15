"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { MemberTilePicker } from "@/components/family/member-tile-picker";
import { Label } from "@/components/ui/label";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";

interface ChoreAssigneePickerProps {
  profile: Profile | null;
  members: FamilyMember[];
  assignedTo: string | null;
  onAssigneeChange: (memberId: string | null) => void;
}

export function ChoreAssigneePicker({
  profile,
  members,
  assignedTo,
  onAssigneeChange,
}: ChoreAssigneePickerProps) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id && members.length > 0;

  if (!isFamily) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t.chores.assigneeLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.assigneeHint}</p>
      </div>

      <input type="hidden" name={CHORE_FORM_FIELD.ASSIGNED_TO} value={assignedTo ?? ""} />

      <MemberTilePicker
        mode="single-nullable"
        members={members}
        value={assignedTo}
        onChange={onAssigneeChange}
        unassignedLabel={t.chores.assigneeUnassigned}
      />
    </div>
  );
}

export function resolveChoreAssigneeName(
  assignedTo: string | null,
  profile: Profile | null,
  members: FamilyMember[],
  unassignedLabel: string
): string {
  if (!assignedTo) return unassignedLabel;
  if (profile && profile.id === assignedTo) return getDisplayName(profile);
  const member = members.find((m) => m.id === assignedTo);
  return member ? getDisplayName(member) : unassignedLabel;
}
