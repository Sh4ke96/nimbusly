import type { PetCareItem } from "@/lib/pets/types";
import { normalizePetName } from "@/lib/pets/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type PetCareChangeLabels = Pick<
  Dict["pets"],
  | "changeSummaryName"
  | "changeSummaryCareType"
  | "changeSummaryLastDone"
  | "changeSummaryNextDue"
  | "changeSummaryStock"
  | "changeSummaryQuantity"
  | "changeSummaryNotes"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "careTypeLabels"
  | "stockStatusLabels"
>;

export function buildPetCareChangeSummary(
  before: Pick<
    PetCareItem,
    | "name"
    | "care_type"
    | "last_done_at"
    | "next_due_date"
    | "stock_status"
    | "quantity"
    | "notes"
  >,
  after: Pick<
    PetCareItem,
    | "name"
    | "care_type"
    | "last_done_at"
    | "next_due_date"
    | "stock_status"
    | "quantity"
    | "notes"
  >,
  labels: PetCareChangeLabels
): string {
  const parts: string[] = [];

  if (normalizePetName(before.name) !== normalizePetName(after.name)) {
    parts.push(formatMessage(labels.changeSummaryName, { from: before.name, to: after.name }));
  }
  if (before.care_type !== after.care_type) {
    parts.push(
      formatMessage(labels.changeSummaryCareType, {
        from: labels.careTypeLabels[before.care_type],
        to: labels.careTypeLabels[after.care_type],
      })
    );
  }
  if (before.last_done_at !== after.last_done_at) {
    parts.push(labels.changeSummaryLastDone);
  }
  if (before.next_due_date !== after.next_due_date) {
    parts.push(labels.changeSummaryNextDue);
  }
  if (before.stock_status !== after.stock_status) {
    parts.push(labels.changeSummaryStock);
  }
  if (before.quantity !== after.quantity) {
    parts.push(labels.changeSummaryQuantity);
  }
  if (before.notes !== after.notes) {
    parts.push(labels.changeSummaryNotes);
  }

  if (parts.length === 0) return labels.changeSummaryEmpty;
  return parts.join(labels.changeSummarySeparator);
}

export function formatPetCareNotificationDetail(
  petName: string,
  itemName: string,
  careTypeLabel: string,
  labels: Pick<Dict["pets"], "notificationDetailSeparator">
): string {
  return `${petName}${labels.notificationDetailSeparator}${normalizePetName(itemName)}${labels.notificationDetailSeparator}${careTypeLabel}`;
}
