import type { MedicineItem } from "@/lib/medicine/types";
import { normalizeMedicineName } from "@/lib/medicine/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type MedicineChangeLabels = Pick<
  Dict["medicineCabinet"],
  | "changeSummaryName"
  | "changeSummaryForm"
  | "changeSummaryQuantity"
  | "changeSummaryExpiry"
  | "changeSummaryAvailability"
  | "changeSummaryLocation"
  | "changeSummaryNotes"
  | "changeSummaryTakenBy"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "formLabels"
  | "availabilityLabels"
  | "takenByUnassigned"
>;

export function buildMedicineChangeSummary(
  before: Pick<
    MedicineItem,
    | "name"
    | "form_type"
    | "quantity"
    | "expiry_date"
    | "availability"
    | "location"
    | "notes"
    | "taken_by"
  >,
  after: Pick<
    MedicineItem,
    | "name"
    | "form_type"
    | "quantity"
    | "expiry_date"
    | "availability"
    | "location"
    | "notes"
    | "taken_by"
  >,
  labels: MedicineChangeLabels,
  resolveTakenBy: (id: string | null) => string
): string {
  const parts: string[] = [];

  if (normalizeMedicineName(before.name) !== normalizeMedicineName(after.name)) {
    parts.push(
      formatMessage(labels.changeSummaryName, { from: before.name, to: after.name })
    );
  }

  if (before.form_type !== after.form_type) {
    parts.push(
      formatMessage(labels.changeSummaryForm, {
        from: labels.formLabels[before.form_type],
        to: labels.formLabels[after.form_type],
      })
    );
  }

  if (before.quantity !== after.quantity) {
    parts.push(labels.changeSummaryQuantity);
  }

  if (before.expiry_date !== after.expiry_date) {
    parts.push(labels.changeSummaryExpiry);
  }

  if (before.availability !== after.availability) {
    parts.push(
      formatMessage(labels.changeSummaryAvailability, {
        from: labels.availabilityLabels[before.availability],
        to: labels.availabilityLabels[after.availability],
      })
    );
  }

  if (before.location !== after.location) {
    parts.push(labels.changeSummaryLocation);
  }

  if (before.notes !== after.notes) {
    parts.push(labels.changeSummaryNotes);
  }

  if (before.taken_by !== after.taken_by) {
    parts.push(
      formatMessage(labels.changeSummaryTakenBy, {
        from: resolveTakenBy(before.taken_by),
        to: resolveTakenBy(after.taken_by),
      })
    );
  }

  if (parts.length === 0) {
    return labels.changeSummaryEmpty;
  }

  return parts.join(labels.changeSummarySeparator);
}

export function formatMedicineNotificationDetail(
  name: string,
  formLabel: string,
  labels: Pick<Dict["medicineCabinet"], "notificationDetailSeparator">
): string {
  return `${normalizeMedicineName(name)}${labels.notificationDetailSeparator}${formLabel}`;
}
