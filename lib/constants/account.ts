export const ACCOUNT_MODE = {
  FAMILY: "family",
  SOLO: "solo",
} as const;

export type AccountMode = (typeof ACCOUNT_MODE)[keyof typeof ACCOUNT_MODE];

export const FAMILY_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type FamilyRole = (typeof FAMILY_ROLE)[keyof typeof FAMILY_ROLE];

export const FAMILY_SETUP_INTENT = {
  CREATE: "create",
  JOIN: "join",
  SOLO: "solo",
} as const;

export type FamilySetupIntent =
  (typeof FAMILY_SETUP_INTENT)[keyof typeof FAMILY_SETUP_INTENT];

export const FAMILY_SETUP_INTENT_VALUES = Object.values(FAMILY_SETUP_INTENT);
