"use client";

import { GIFT_FORM_FIELD } from "@/lib/gifts/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GiftRecipientPicker,
  type GiftRecipientSelection,
} from "@/components/gifts/gift-recipient-picker";
import {
  GiftVisibilityPicker,
  type GiftVisibilitySelection,
} from "@/components/gifts/gift-visibility-picker";
import { GIFT_CONTENT_MAX_LENGTH, GIFT_LINK_URL_MAX_LENGTH } from "@/lib/constants/gifts";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import type { FamilyMember, Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";

interface GiftEntryFormProps {
  id?: string;
  profile: Profile | null;
  members: FamilyMember[];
  recipient: GiftRecipientSelection | null;
  onRecipientChange: (selection: GiftRecipientSelection) => void;
  content: string;
  onContentChange: (value: string) => void;
  linkUrl: string;
  onLinkUrlChange: (value: string) => void;
  visibility: GiftVisibilitySelection;
  onVisibilityChange: (value: GiftVisibilitySelection) => void;
}

export function GiftEntryForm({
  id,
  profile,
  members,
  recipient,
  onRecipientChange,
  content,
  onContentChange,
  linkUrl,
  onLinkUrlChange,
  visibility,
  onVisibilityChange,
}: GiftEntryFormProps) {
  const t = useT();
  const contentId = id ? `${id}-content` : "gift-content";
  const linkId = id ? `${id}-link` : "gift-link";
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id && members.length > 0;

  return (
    <>
      {id && <input type="hidden" name={GIFT_FORM_FIELD.ID} value={id} />}

      <GiftRecipientPicker
        profile={profile}
        members={members}
        selection={recipient}
        onChange={onRecipientChange}
      />

      <div className="space-y-1.5">
        <Label htmlFor={contentId}>{t.gifts.contentLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.gifts.contentHint}</p>
        <Textarea
          id={contentId}
          name={GIFT_FORM_FIELD.CONTENT}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          maxLength={GIFT_CONTENT_MAX_LENGTH}
          placeholder={t.gifts.contentPlaceholder}
          required
          className="min-h-32"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={linkId}>{t.gifts.linkUrlLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.gifts.linkUrlHint}</p>
        <Input
          id={linkId}
          name={GIFT_FORM_FIELD.LINK_URL}
          type="url"
          inputMode="url"
          value={linkUrl}
          onChange={(e) => onLinkUrlChange(e.target.value)}
          maxLength={GIFT_LINK_URL_MAX_LENGTH}
          placeholder={t.gifts.linkUrlPlaceholder}
          className="rounded-none"
        />
      </div>

      {isFamily && (
        <GiftVisibilityPicker
          members={members}
          value={visibility}
          onChange={onVisibilityChange}
        />
      )}
    </>
  );
}
