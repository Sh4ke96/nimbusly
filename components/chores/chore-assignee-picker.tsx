"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Label } from "@/components/ui/label";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

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

      <input type="hidden" name="assignedTo" value={assignedTo ?? ""} />

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAssigneeChange(null)}
          className={cn(
            "cursor-pointer rounded-none border border-border px-3 py-2.5 text-left text-sm transition-colors",
            assignedTo === null
              ? "border-primary bg-primary/10"
              : "bg-background hover:bg-muted/60"
          )}
        >
          {t.chores.assigneeUnassigned}
        </button>

        {members.map((member) => {
          const selected = assignedTo === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onAssigneeChange(member.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-none border border-border px-3 py-2 text-left text-sm transition-colors",
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
              <span className="font-medium">{getDisplayName(member)}</span>
            </button>
          );
        })}
      </div>
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
