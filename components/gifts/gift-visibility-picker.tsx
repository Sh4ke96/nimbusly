"use client";

import {
  FamilyVisibilityPicker,
  type FamilyVisibilitySelection,
  isValidFamilyVisibilitySelection,
} from "@/components/family/family-visibility-picker";
import { GIFT_FORM_FIELD } from "@/lib/gifts/types";
import {
  isGiftVisibleToAllMembers,
  serializeVisibleMemberIds,
} from "@/lib/gifts/visibility";
import type { FamilyMember } from "@/lib/profile";
import { useT } from "@/lib/lang-context";

export type GiftVisibilitySelection = FamilyVisibilitySelection;

interface GiftVisibilityPickerProps {
  members: FamilyMember[];
  value: GiftVisibilitySelection;
  onChange: (value: GiftVisibilitySelection) => void;
}

export function GiftVisibilityPicker({ members, value, onChange }: GiftVisibilityPickerProps) {
  const t = useT();

  return (
    <FamilyVisibilityPicker
      members={members}
      value={value}
      onChange={onChange}
      labels={{
        label: t.gifts.visibilityLabel,
        hint: t.gifts.visibilityHint,
        allFamily: t.gifts.visibilityAllFamily,
        selectedMembers: t.gifts.visibilitySelectedMembers,
      }}
      hiddenFieldName={GIFT_FORM_FIELD.VISIBLE_MEMBER_IDS}
      serializeMemberIds={serializeVisibleMemberIds}
    />
  );
}

export function giftIdeaToVisibilitySelection(
  idea: Pick<import("@/lib/gifts/types").GiftIdea, "visible_to_member_ids">
): GiftVisibilitySelection {
  if (isGiftVisibleToAllMembers(idea.visible_to_member_ids)) {
    return { visibleToAll: true, memberIds: [] };
  }
  return {
    visibleToAll: false,
    memberIds: [...idea.visible_to_member_ids],
  };
}

export function isValidGiftVisibilitySelection(selection: GiftVisibilitySelection): boolean {
  return isValidFamilyVisibilitySelection(selection);
}
