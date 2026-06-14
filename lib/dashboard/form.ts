import { getFormTrimmedString } from "@/lib/form/values";

export const DASHBOARD_FORM_FIELD = {
  LAYOUT: "layout",
} as const;

export function parseDashboardLayoutFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, DASHBOARD_FORM_FIELD.LAYOUT);
}
