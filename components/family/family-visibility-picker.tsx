"use client";

import { MemberTilePicker } from "@/components/family/member-tile-picker";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import type { FamilyMember } from "@/lib/profile";

export interface FamilyVisibilitySelection {
  visibleToAll: boolean;
  memberIds: string[];
}

interface FamilyVisibilityPickerProps {
  members: FamilyMember[];
  value: FamilyVisibilitySelection;
  onChange: (value: FamilyVisibilitySelection) => void;
  labels: {
    label: string;
    hint: string;
    allFamily: string;
    selectedMembers: string;
  };
  hiddenFieldName: string;
  serializeMemberIds: (ids: string[]) => string;
}

export function FamilyVisibilityPicker({
  members,
  value,
  onChange,
  labels,
  hiddenFieldName,
  serializeMemberIds,
}: FamilyVisibilityPickerProps) {
  const selected = new Set(value.memberIds);
  const serializedIds = value.visibleToAll ? [] : value.memberIds;

  function toggleMember(memberId: string) {
    if (selected.has(memberId)) {
      const next = value.memberIds.filter((id) => id !== memberId);
      onChange({ visibleToAll: false, memberIds: next });
      return;
    }
    onChange({
      visibleToAll: false,
      memberIds: [...value.memberIds, memberId],
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{labels.label}</p>
        <p className="text-xs text-muted-foreground">{labels.hint}</p>
      </div>

      <input
        type="hidden"
        name={hiddenFieldName}
        value={serializeMemberIds(serializedIds)}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ visibleToAll: true, memberIds: [] })}
          className={selectionPickerTileButtonClasses(value.visibleToAll)}
        >
          {labels.allFamily}
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              visibleToAll: false,
              memberIds: value.visibleToAll && members[0] ? [members[0].id] : value.memberIds,
            })
          }
          className={selectionPickerTileButtonClasses(!value.visibleToAll)}
        >
          {labels.selectedMembers}
        </button>
      </div>

      {!value.visibleToAll && (
        <MemberTilePicker
          mode="multi"
          members={members}
          selectedIds={value.memberIds}
          onChange={(memberIds) => onChange({ visibleToAll: false, memberIds })}
        />
      )}
    </div>
  );
}

export function isValidFamilyVisibilitySelection(selection: FamilyVisibilitySelection): boolean {
  if (selection.visibleToAll) return true;
  return selection.memberIds.length > 0;
}
