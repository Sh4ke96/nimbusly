import type { FamilySetupIntent } from "@/lib/profile";

export const INVITE_TOKEN_COOKIE = "nimbusly-invite-token";
export const INVITE_CODE_COOKIE = "nimbusly-invite-code";
export const INVITE_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export function parseFamilySetupIntent(value: FormDataEntryValue | null): FamilySetupIntent | null {
  if (value === "create" || value === "join" || value === "solo") return value;
  return null;
}
