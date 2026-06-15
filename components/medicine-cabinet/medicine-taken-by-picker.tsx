"use client";

import { MEDICINE_FORM_FIELD } from "@/lib/medicine/types";
import { MemberTilePicker } from "@/components/family/member-tile-picker";
import { Label } from "@/components/ui/label";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";

interface MedicineTakenByPickerProps {
  profile: Profile | null;
  members: FamilyMember[];
  takenBy: string | null;
  onTakenByChange: (memberId: string | null) => void;
}

export function MedicineTakenByPicker({
  profile,
  members,
  takenBy,
  onTakenByChange,
}: MedicineTakenByPickerProps) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id && members.length > 0;

  if (!isFamily) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t.medicineCabinet.takenByLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.takenByHint}</p>
      </div>

      <input type="hidden" name={MEDICINE_FORM_FIELD.TAKEN_BY} value={takenBy ?? ""} />

      <MemberTilePicker
        mode="single-nullable"
        members={members}
        value={takenBy}
        onChange={onTakenByChange}
        unassignedLabel={t.medicineCabinet.takenByUnassigned}
      />
    </div>
  );
}

export function resolveMedicineTakenByName(
  takenBy: string | null,
  profile: Profile | null,
  members: FamilyMember[],
  unassignedLabel: string
): string | null {
  if (!takenBy) return null;
  if (profile && profile.id === takenBy) return getDisplayName(profile);
  const member = members.find((m) => m.id === takenBy);
  return member ? getDisplayName(member) : unassignedLabel;
}
