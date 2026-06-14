"use client";

import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToEntryDateString } from "@/lib/schedule/types";

interface ScheduleDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function ScheduleDatePicker({ date, onDateChange }: ScheduleDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.schedule.dateLabel}
      hint={t.schedule.dateHint}
      placeholder={t.schedule.pickDate}
      date={date}
      onDateChange={onDateChange}
      hiddenInputs={
        <input
          type="hidden"
          name="entryDate"
          value={date ? dateToEntryDateString(date) : ""}
        />
      }
    />
  );
}
