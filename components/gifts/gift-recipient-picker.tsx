"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/member-avatar";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { GIFT_RECIPIENT_TYPE, type GiftRecipientType } from "@/lib/constants/gifts";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

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

      <input type="hidden" name="recipientType" value={recipientType} />
      <input type="hidden" name="recipientMemberId" value={memberId} />
      <input
        type="hidden"
        name="recipientName"
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
            className={cn(
              "cursor-pointer rounded-none border border-border px-3 py-2.5 text-left text-sm transition-colors",
              recipientType === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER
                ? "border-primary bg-primary/10"
                : "bg-background hover:bg-muted/60"
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
            className={cn(
              "cursor-pointer rounded-none border border-border px-3 py-2.5 text-left text-sm transition-colors",
              recipientType === GIFT_RECIPIENT_TYPE.CUSTOM
                ? "border-primary bg-primary/10"
                : "bg-background hover:bg-muted/60"
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
            {members.map((member) => {
              const selected = memberId === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
                      memberId: member.id,
                      name: getDisplayName(member),
                    })
                  }
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
