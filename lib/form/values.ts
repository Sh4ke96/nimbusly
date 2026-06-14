export function getFormString(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export function getFormTrimmedString(formData: FormData, field: string): string {
  return getFormString(formData, field).trim();
}

export function getFormNumber(formData: FormData, field: string): number {
  return Number(getFormString(formData, field));
}

export function getFormBooleanTrue(formData: FormData, field: string): boolean {
  return getFormString(formData, field) === "true";
}
