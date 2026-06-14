"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GiftRecipientPicker,
  type GiftRecipientSelection,
} from "@/components/gifts/gift-recipient-picker";
import { GIFT_CONTENT_MAX_LENGTH } from "@/lib/constants/gifts";
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
}

export function GiftEntryForm({
  id,
  profile,
  members,
  recipient,
  onRecipientChange,
  content,
  onContentChange,
}: GiftEntryFormProps) {
  const t = useT();
  const contentId = id ? `${id}-content` : "gift-content";

  return (
    <>
      {id && <input type="hidden" name="id" value={id} />}

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
          name="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          maxLength={GIFT_CONTENT_MAX_LENGTH}
          placeholder={t.gifts.contentPlaceholder}
          required
          className="min-h-32"
        />
      </div>
    </>
  );
}
