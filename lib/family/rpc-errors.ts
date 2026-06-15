import type { Dict } from "@/lib/i18n/types";

export function mapFamilyRpcError(
  message: string,
  labels: Pick<
    Dict["account"],
    | "errorFounderMustTransfer"
    | "errorCannotRemoveFounder"
    | "errorCannotDemoteFounder"
    | "errorNotFamilyAdmin"
    | "errorUseLeaveFamily"
    | "errorAlreadyFounder"
    | "errorGeneric"
  >
): string {
  if (message.includes("Founder must transfer ownership")) {
    return labels.errorFounderMustTransfer;
  }
  if (message.includes("Cannot remove family founder")) {
    return labels.errorCannotRemoveFounder;
  }
  if (message.includes("Cannot demote family founder")) {
    return labels.errorCannotDemoteFounder;
  }
  if (message.includes("Not authorized") || message.includes("Not in family")) {
    return labels.errorNotFamilyAdmin;
  }
  if (message.includes("Use leave family for self")) {
    return labels.errorUseLeaveFamily;
  }
  if (message.includes("Already founder")) {
    return labels.errorAlreadyFounder;
  }
  return labels.errorGeneric;
}
