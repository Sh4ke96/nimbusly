"use client";

import { GIFT_FORM_FIELD } from "@/lib/gifts/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MemberTilePicker } from "@/components/family/member-tile-picker";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { useT } from "@/lib/lang-context";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";

export type GiftRecipientSelection =
  | { type: typeof GIFT_RECIPIENT_TYPE.FAMILY_MEMBER; memberId: string; name: string }
  | { type: typeof GIFT_RECIPIENT_TYPE.CUSTOM; name: string };

interface GiftRecipientPickerProps {
  profile: Profile | null;
  members: FamilyMember[];
  selection: GiftRecipientSelection | null;
  onChange: (selection: GiftRecipientSelection) => void;
}

export function GiftRecipientPicker({
  profile,
  members,
  selection,
  onChange,
}: GiftRecipientPickerProps) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id && members.length > 0;

  const recipientType = selection?.type ?? (isFamily ? "" : GIFT_RECIPIENT_TYPE.CUSTOM);
  const customName =
    selection?.type === GIFT_RECIPIENT_TYPE.CUSTOM ? selection.name : "";
  const memberId =
    selection?.type === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER ? selection.memberId : "";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t.gifts.recipientLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.gifts.recipientHint}</p>
      </div>

      <input type="hidden" name={GIFT_FORM_FIELD.RECIPIENT_TYPE} value={recipientType} />
      <input type="hidden" name={GIFT_FORM_FIELD.RECIPIENT_MEMBER_ID} value={memberId} />
      <input
        type="hidden"
        name={GIFT_FORM_FIELD.RECIPIENT_NAME}
        value={
          selection?.type === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER
            ? selection.name
            : customName
        }
      />

      {isFamily && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const firstMember = members[0];
              if (!firstMember) return;
              onChange({
                type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
                memberId: firstMember.id,
                name: getDisplayName(firstMember),
              });
            }}
            className={selectionPickerTileButtonClasses(
              recipientType === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER
            )}
          >
            {t.gifts.recipientFamilyMember}
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                type: GIFT_RECIPIENT_TYPE.CUSTOM,
                name: customName,
              })
            }
            className={selectionPickerTileButtonClasses(
              recipientType === GIFT_RECIPIENT_TYPE.CUSTOM
            )}
          >
            {t.gifts.recipientCustom}
          </button>
        </div>
      )}

      {isFamily && recipientType === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER && (
        <div className="space-y-2">
          <Label>{t.gifts.recipientMemberLabel}</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <MemberTilePicker
              mode="single"
              members={members}
              value={memberId}
              onChange={(id) => {
                const member = members.find((m) => m.id === id);
                if (!member) return;
                onChange({
                  type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
                  memberId: member.id,
                  name: getDisplayName(member),
                });
              }}
            />
          </div>
        </div>
      )}

      {(!isFamily || recipientType === GIFT_RECIPIENT_TYPE.CUSTOM) && (
        <div className="space-y-1.5">
          <Label htmlFor="gift-recipient-name">{t.gifts.recipientNameLabel}</Label>
          <Input
            id="gift-recipient-name"
            value={customName}
            onChange={(e) =>
              onChange({
                type: GIFT_RECIPIENT_TYPE.CUSTOM,
                name: e.target.value,
              })
            }
            placeholder={t.gifts.recipientNamePlaceholder}
            required={!isFamily || recipientType === GIFT_RECIPIENT_TYPE.CUSTOM}
          />
        </div>
      )}
    </div>
  );
}

export function giftIdeaToRecipientSelection(
  idea: Pick<
    import("@/lib/gifts/types").GiftIdea,
    "recipient_type" | "recipient_member_id" | "recipient_name"
  >
): GiftRecipientSelection {
  if (idea.recipient_type === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER && idea.recipient_member_id) {
    return {
      type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
      memberId: idea.recipient_member_id,
      name: idea.recipient_name,
    };
  }
  return {
    type: GIFT_RECIPIENT_TYPE.CUSTOM,
    name: idea.recipient_name,
  };
}
