import { parseFamilySetupIntent } from "@/lib/family/constants";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";

export const PROFILE_FORM_FIELD = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  AVATAR_COLOR: "avatarColor",
  ACCOUNT_MODE: "accountMode",
  FAMILY_NAME: "familyName",
  FAMILY_INTENT: "familyIntent",
  INVITE_CODE: "inviteCode",
  INVITE_TOKEN: "inviteToken",
} as const;

export function parseProfileNamesFromForm(formData: FormData): {
  firstName: string;
  lastName: string;
  avatarColor: string;
} {
  return {
    firstName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.FIRST_NAME),
    lastName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.LAST_NAME),
    avatarColor: getFormString(formData, PROFILE_FORM_FIELD.AVATAR_COLOR),
  };
}

export function parseAccountModeSetupFromForm(formData: FormData): {
  accountMode: string;
  familyName: string;
} {
  return {
    accountMode: getFormString(formData, PROFILE_FORM_FIELD.ACCOUNT_MODE),
    familyName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.FAMILY_NAME),
  };
}

export function parseFamilyRenameFromForm(formData: FormData): { familyName: string } {
  return {
    familyName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.FAMILY_NAME),
  };
}

export function parseOnboardingFromForm(formData: FormData): {
  firstName: string;
  lastName: string;
  avatarColor: string;
  familyIntent: ReturnType<typeof parseFamilySetupIntent>;
  familyName: string;
  inviteCode: string;
  inviteToken: string;
} {
  return {
    firstName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.FIRST_NAME),
    lastName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.LAST_NAME),
    avatarColor: getFormString(formData, PROFILE_FORM_FIELD.AVATAR_COLOR),
    familyIntent: parseFamilySetupIntent(
      formData.get(PROFILE_FORM_FIELD.FAMILY_INTENT)
    ),
    familyName: getFormTrimmedString(formData, PROFILE_FORM_FIELD.FAMILY_NAME),
    inviteCode: getFormTrimmedString(formData, PROFILE_FORM_FIELD.INVITE_CODE),
    inviteToken: getFormTrimmedString(formData, PROFILE_FORM_FIELD.INVITE_TOKEN),
  };
}
