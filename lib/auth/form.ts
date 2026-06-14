import { getFormString, getFormTrimmedString } from "@/lib/form/values";

export const AUTH_FORM_FIELD = {
  EMAIL: "email",
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirmPassword",
  INVITE_CODE: "inviteCode",
} as const;

export function parseSignInFromForm(formData: FormData): {
  email: string;
  password: string;
} {
  return {
    email: getFormString(formData, AUTH_FORM_FIELD.EMAIL),
    password: getFormString(formData, AUTH_FORM_FIELD.PASSWORD),
  };
}

export function parseSignUpFromForm(formData: FormData): {
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
} {
  return {
    email: getFormString(formData, AUTH_FORM_FIELD.EMAIL),
    password: getFormString(formData, AUTH_FORM_FIELD.PASSWORD),
    confirmPassword: getFormString(formData, AUTH_FORM_FIELD.CONFIRM_PASSWORD),
    inviteCode: getFormTrimmedString(formData, AUTH_FORM_FIELD.INVITE_CODE),
  };
}
