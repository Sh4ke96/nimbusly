import {
  GIFT_CONTENT_MAX_LENGTH,
  GIFT_RECIPIENT_TYPE,
  GIFT_RECIPIENT_TYPES,
  type GiftRecipientType,
} from "@/lib/constants/gifts";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";
import { isValidGiftLinkUrl, normalizeGiftLinkUrl } from "@/lib/gifts/url";
import { parseVisibleMemberIdsJson } from "@/lib/gifts/visibility";

export interface GiftIdea {
  id: string;
  family_id: string | null;
  recipient_type: GiftRecipientType;
  recipient_member_id: string | null;
  recipient_name: string;
  content: string;
  link_url: string | null;
  visible_to_member_ids: string[];
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

export function parseGiftLinkUrlFromForm(formData: FormData): string | null {
  const raw = getFormTrimmedString(formData, GIFT_FORM_FIELD.LINK_URL);
  if (!raw) return null;
  const normalized = normalizeGiftLinkUrl(raw);
  return isValidGiftLinkUrl(normalized) ? normalized : null;
}

export function isValidGiftLinkUrlField(url: string | null): boolean {
  if (url === null) return true;
  return isValidGiftLinkUrl(url);
}

export function parseGiftVisibleMemberIdsFromForm(formData: FormData): string[] | null {
  return parseVisibleMemberIdsJson(
    getFormString(formData, GIFT_FORM_FIELD.VISIBLE_MEMBER_IDS)
  );
}

export function getGiftRecipientFilterKey(
  entry: Pick<GiftIdea, "recipient_member_id" | "recipient_name">
): string {
  if (entry.recipient_member_id) {
    return `member:${entry.recipient_member_id}`;
  }
  return `custom:${normalizeRecipientName(entry.recipient_name).toLowerCase()}`;
}

export const GIFT_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  RECIPIENT_TYPE: "recipientType",
  RECIPIENT_MEMBER_ID: "recipientMemberId",
  RECIPIENT_NAME: "recipientName",
  CONTENT: "content",
  LINK_URL: "linkUrl",
  VISIBLE_MEMBER_IDS: "visibleMemberIds",
} as const;

export function parseGiftRecipientFromForm(formData: FormData): {
  recipientType: GiftRecipientType | null;
  recipientMemberId: string | null;
  recipientName: string;
} {
  const recipientTypeRaw = getFormTrimmedString(formData, GIFT_FORM_FIELD.RECIPIENT_TYPE);
  const recipientMemberId =
    getFormTrimmedString(formData, GIFT_FORM_FIELD.RECIPIENT_MEMBER_ID) || null;
  const recipientName = normalizeRecipientName(
    getFormString(formData, GIFT_FORM_FIELD.RECIPIENT_NAME)
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

export function parseGiftContentFromForm(formData: FormData): { content: string } {
  return {
    content: getFormTrimmedString(formData, GIFT_FORM_FIELD.CONTENT),
  };
}

export function parseGiftIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, GIFT_FORM_FIELD.ID);
}
