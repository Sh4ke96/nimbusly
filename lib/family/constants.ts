import {
  FAMILY_SETUP_INTENT,
  FAMILY_SETUP_INTENT_VALUES,
  type FamilySetupIntent,
} from "@/lib/constants/account";

export const INVITE_TOKEN_COOKIE = "nimbusly-invite-token";
export const INVITE_CODE_COOKIE = "nimbusly-invite-code";
export const INVITE_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export function parseFamilySetupIntent(
  value: FormDataEntryValue | null
): FamilySetupIntent | null {
  if (typeof value !== "string") return null;
  return FAMILY_SETUP_INTENT_VALUES.includes(value as FamilySetupIntent)
    ? (value as FamilySetupIntent)
    : null;
}

export { FAMILY_SETUP_INTENT };
