"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { MemberTilePicker } from "@/components/family/member-tile-picker";
import { Label } from "@/components/ui/label";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import type { FamilyMember, Profile } from "@/lib/profile";

interface BudgetMemberPickerProps {
  profile: Profile | null;
  members: FamilyMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function BudgetMemberPicker({
  profile,
  members,
  selectedIds,
  onChange,
}: BudgetMemberPickerProps) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id && members.length > 0;

  if (!isFamily) return null;

  return (
    <div className="space-y-2">
      <Label>{t.budget.membersLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.budget.membersHint}</p>
      <MemberTilePicker
        mode="multi"
        members={members}
        selectedIds={selectedIds}
        onChange={onChange}
        nameClassName="truncate"
        gridClassName="grid grid-cols-2 gap-2 sm:grid-cols-3"
      />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={BUDGET_FORM_FIELD.MEMBER_IDS} value={id} />
      ))}
    </div>
  );
}
