"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { MEDICINE_EXPIRY_STATUS } from "@/lib/constants/medicine";
import { daysUntilExpiry, getMedicineExpiryStatus } from "@/lib/medicine/expiry";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface MedicineExpiryBadgeProps {
  expiryDate: string;
}

export function MedicineExpiryBadge({ expiryDate }: MedicineExpiryBadgeProps) {
  const t = useT();
  const status = getMedicineExpiryStatus(expiryDate);
  const days = daysUntilExpiry(expiryDate);

  if (status === MEDICINE_EXPIRY_STATUS.NONE || status === MEDICINE_EXPIRY_STATUS.OK) {
    return null;
  }

  const isExpired = status === MEDICINE_EXPIRY_STATUS.EXPIRED;
  const label = isExpired
    ? t.medicineCabinet.expiryExpired
    : days !== null
      ? formatMessage(t.medicineCabinet.expiryInDays, { count: String(days) })
      : t.medicineCabinet.expirySoon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] font-medium",
        isExpired
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
      )}
    >
      {isExpired ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
      {label}
    </span>
  );
}
