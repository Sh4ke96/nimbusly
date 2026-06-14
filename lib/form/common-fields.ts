import { getFormTrimmedString } from "@/lib/form/values";

export const COMMON_FORM_FIELD = {
  ID: "id",
} as const;

export function parseEntityIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, COMMON_FORM_FIELD.ID);
}
