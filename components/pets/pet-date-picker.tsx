"use client";

import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToPetDateString } from "@/lib/pets/types";

interface PetDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  name: "lastDoneAt" | "nextDueDate";
  label: string;
  hint?: string;
  pickLabel: string;
  showHint?: boolean;
}

export function PetDatePicker({
  date,
  onDateChange,
  name,
  label,
  hint,
  pickLabel,
  showHint = true,
}: PetDatePickerProps) {
  return (
    <DatePickerField
      label={label}
      hint={showHint ? hint : undefined}
      placeholder={pickLabel}
      date={date}
      onDateChange={onDateChange}
      hiddenInputs={
        <input
          type="hidden"
          name={name}
          value={date ? dateToPetDateString(date) : ""}
        />
      }
    />
  );
}
