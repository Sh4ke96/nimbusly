export const GIFT_RECIPIENT_TYPE = {
  FAMILY_MEMBER: "family_member",
  CUSTOM: "custom",
} as const;

export type GiftRecipientType =
  (typeof GIFT_RECIPIENT_TYPE)[keyof typeof GIFT_RECIPIENT_TYPE];

export const GIFT_RECIPIENT_TYPES = Object.values(
  GIFT_RECIPIENT_TYPE
) as GiftRecipientType[];

export const GIFT_FILTER_ALL = "all" as const;

export type GiftRecipientFilterKey = typeof GIFT_FILTER_ALL | `member:${string}` | `custom:${string}`;

export const GIFT_CONTENT_MAX_LENGTH = 2000;
export const GIFT_LINK_URL_MAX_LENGTH = 2048;
