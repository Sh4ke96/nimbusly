import {
  MEDICINE_EXPIRY_STATUS,
  MEDICINE_EXPIRY_WARNING_DAYS,
  type MedicineExpiryStatus,
} from "@/lib/constants/medicine";
import { formatMessage } from "@/lib/i18n/format";
import type { Dict } from "@/lib/i18n/types";
import { parseMedicineDateString } from "@/lib/medicine/types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntilExpiry(
  expiryDate: string | null,
  today: Date = new Date()
): number | null {
  const parsed = parseMedicineDateString(expiryDate);
  if (!parsed) return null;
  const diffMs = startOfDay(parsed).getTime() - startOfDay(today).getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getMedicineExpiryStatus(
  expiryDate: string | null,
  today: Date = new Date(),
  warningDays = MEDICINE_EXPIRY_WARNING_DAYS
): MedicineExpiryStatus {
  if (!expiryDate) return MEDICINE_EXPIRY_STATUS.NONE;
  const days = daysUntilExpiry(expiryDate, today);
  if (days === null) return MEDICINE_EXPIRY_STATUS.NONE;
  if (days < 0) return MEDICINE_EXPIRY_STATUS.EXPIRED;
  if (days <= warningDays) return MEDICINE_EXPIRY_STATUS.WARNING;
  return MEDICINE_EXPIRY_STATUS.OK;
}

export function isMedicineExpiringSoon(
  expiryDate: string | null,
  today: Date = new Date(),
  warningDays = MEDICINE_EXPIRY_WARNING_DAYS
): boolean {
  const status = getMedicineExpiryStatus(expiryDate, today, warningDays);
  return status === MEDICINE_EXPIRY_STATUS.WARNING || status === MEDICINE_EXPIRY_STATUS.EXPIRED;
}

export function sortMedicineByExpiry<
  T extends { expiry_date: string | null; name: string },
>(items: T[], today: Date = new Date()): T[] {
  return [...items].sort((a, b) => {
    const daysA = daysUntilExpiry(a.expiry_date, today);
    const daysB = daysUntilExpiry(b.expiry_date, today);

    if (daysA === null && daysB === null) {
      return a.name.localeCompare(b.name, "pl");
    }
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    if (daysA !== daysB) return daysA - daysB;
    return a.name.localeCompare(b.name, "pl");
  });
}

type MedicineExpiryCountdownLabels = Pick<
  Dict["medicineCabinet"],
  "expiryExpired" | "expiryInDays" | "expiryToday"
>;

export function formatMedicineExpiryCountdown(
  expiryDate: string | null,
  labels: MedicineExpiryCountdownLabels,
  today: Date = new Date()
): string | null {
  const days = daysUntilExpiry(expiryDate, today);
  if (days === null) return null;
  if (days < 0) return labels.expiryExpired;
  if (days === 0) return labels.expiryToday;
  return formatMessage(labels.expiryInDays, { count: String(days) });
}
