import { getFormTrimmedString } from "@/lib/form/values";

export const FAMILY_FORM_FIELD = {
  EMAIL: "email",
  INVITATION_ID: "invitationId",
  INVITE_CODE: "inviteCode",
  MEMBER_ID: "memberId",
  ROLE: "role",
} as const;

export function parseFamilyInviteEmailFromForm(formData: FormData): { email: string } {
  return {
    email: getFormTrimmedString(formData, FAMILY_FORM_FIELD.EMAIL).toLowerCase(),
  };
}

export function parseFamilyInvitationIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, FAMILY_FORM_FIELD.INVITATION_ID);
}

export function parseFamilyInviteCodeFromForm(formData: FormData): { inviteCode: string } {
  return {
    inviteCode: getFormTrimmedString(formData, FAMILY_FORM_FIELD.INVITE_CODE),
  };
}

export function parseFamilyMemberRoleFromForm(formData: FormData): {
  memberId: string;
  role: string;
} {
  return {
    memberId: getFormTrimmedString(formData, FAMILY_FORM_FIELD.MEMBER_ID),
    role: getFormTrimmedString(formData, FAMILY_FORM_FIELD.ROLE),
  };
}

export function parseFamilyMemberIdFromForm(formData: FormData): { memberId: string } {
  return {
    memberId: getFormTrimmedString(formData, FAMILY_FORM_FIELD.MEMBER_ID),
  };
}
