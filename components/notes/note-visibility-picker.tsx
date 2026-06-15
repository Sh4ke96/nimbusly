"use client";

import {
  FamilyVisibilityPicker,
  type FamilyVisibilitySelection,
  isValidFamilyVisibilitySelection,
} from "@/components/family/family-visibility-picker";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import {
  isNoteVisibleToAllMembers,
  serializeVisibleMemberIds,
} from "@/lib/notes/visibility";
import type { FamilyMember } from "@/lib/profile";
import { useT } from "@/lib/lang-context";

export type NoteVisibilitySelection = FamilyVisibilitySelection;

interface NoteVisibilityPickerProps {
  members: FamilyMember[];
  value: NoteVisibilitySelection;
  onChange: (value: NoteVisibilitySelection) => void;
}

export function NoteVisibilityPicker({ members, value, onChange }: NoteVisibilityPickerProps) {
  const t = useT();

  return (
    <FamilyVisibilityPicker
      members={members}
      value={value}
      onChange={onChange}
      labels={{
        label: t.notes.visibilityLabel,
        hint: t.notes.visibilityHint,
        allFamily: t.notes.visibilityAllFamily,
        selectedMembers: t.notes.visibilitySelectedMembers,
      }}
      hiddenFieldName={NOTE_FORM_FIELD.VISIBLE_MEMBER_IDS}
      serializeMemberIds={serializeVisibleMemberIds}
    />
  );
}

export function noteToVisibilitySelection(
  note: Pick<import("@/lib/notes/types").Note, "visible_to_member_ids">
): NoteVisibilitySelection {
  if (isNoteVisibleToAllMembers(note.visible_to_member_ids)) {
    return { visibleToAll: true, memberIds: [] };
  }
  return {
    visibleToAll: false,
    memberIds: [...note.visible_to_member_ids],
  };
}

export function isValidNoteVisibilitySelection(selection: NoteVisibilitySelection): boolean {
  return isValidFamilyVisibilitySelection(selection);
}
