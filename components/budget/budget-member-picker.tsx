"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { MemberAvatar } from "@/components/member-avatar";
import { Label } from "@/components/ui/label";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

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

  function toggleMember(memberId: string) {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter((id) => id !== memberId));
      return;
    }
    onChange([...selectedIds, memberId]);
  }

  return (
    <div className="space-y-2">
      <Label>{t.budget.membersLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.budget.membersHint}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleMember(member.id)}
              className={cn(
                "cursor-pointer flex items-center gap-2 rounded-none border border-border px-3 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/10"
                  : "bg-background hover:bg-muted/60"
              )}
            >
              <MemberAvatar
                name={getDisplayName(member)}
                color={member.avatar_color}
                size="sm"
              />
              <span className="truncate">{getDisplayName(member)}</span>
            </button>
          );
        })}
      </div>
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={BUDGET_FORM_FIELD.MEMBER_IDS} value={id} />
      ))}
    </div>
  );
}
