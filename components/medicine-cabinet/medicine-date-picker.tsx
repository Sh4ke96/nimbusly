"use client";

import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToMedicineDateString } from "@/lib/medicine/types";

interface MedicineDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  showHint?: boolean;
}

export function MedicineDatePicker({
  date,
  onDateChange,
  showHint = true,
}: MedicineDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.medicineCabinet.expiryLabel}
      hint={showHint ? t.medicineCabinet.expiryHint : undefined}
      placeholder={t.medicineCabinet.pickExpiryDate}
      date={date}
      onDateChange={onDateChange}
      hiddenInputs={
        <input
          type="hidden"
          name="expiryDate"
          value={date ? dateToMedicineDateString(date) : ""}
        />
      }
    />
  );
}
