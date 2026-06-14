import {
  GIFT_CONTENT_MAX_LENGTH,
  GIFT_RECIPIENT_TYPE,
  GIFT_RECIPIENT_TYPES,
  type GiftRecipientType,
} from "@/lib/constants/gifts";

export interface GiftIdea {
  id: string;
  family_id: string | null;
  recipient_type: GiftRecipientType;
  recipient_member_id: string | null;
  recipient_name: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function isValidGiftRecipientType(value: string): value is GiftRecipientType {
  return GIFT_RECIPIENT_TYPES.includes(value as GiftRecipientType);
}

export function normalizeRecipientName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidRecipientName(name: string): boolean {
  return normalizeRecipientName(name).length > 0;
}

export function isValidGiftContent(content: string): boolean {
  return content.trim().length > 0 && content.length <= GIFT_CONTENT_MAX_LENGTH;
}

export function getGiftRecipientFilterKey(
  entry: Pick<GiftIdea, "recipient_member_id" | "recipient_name">
): string {
  if (entry.recipient_member_id) {
    return `member:${entry.recipient_member_id}`;
  }
  return `custom:${normalizeRecipientName(entry.recipient_name).toLowerCase()}`;
}

export function parseGiftRecipientFromForm(formData: FormData): {
  recipientType: GiftRecipientType | null;
  recipientMemberId: string | null;
  recipientName: string;
} {
  const recipientTypeRaw = (formData.get("recipientType") as string)?.trim();
  const recipientMemberId = (formData.get("recipientMemberId") as string)?.trim() || null;
  const recipientName = normalizeRecipientName(
    (formData.get("recipientName") as string) ?? ""
  );

  if (!isValidGiftRecipientType(recipientTypeRaw)) {
    return { recipientType: null, recipientMemberId: null, recipientName };
  }

  if (recipientTypeRaw === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER) {
    return {
      recipientType: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
      recipientMemberId,
      recipientName,
    };
  }

  return {
    recipientType: GIFT_RECIPIENT_TYPE.CUSTOM,
    recipientMemberId: null,
    recipientName,
  };
}
