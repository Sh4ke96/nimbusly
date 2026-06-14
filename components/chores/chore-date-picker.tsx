"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToChoreDateString } from "@/lib/chores/types";

interface ChoreDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function ChoreDatePicker({ date, onDateChange }: ChoreDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.chores.dueDateLabel}
      hint={t.chores.dueDateHint}
      placeholder={t.chores.pickDueDate}
      date={date}
      onDateChange={onDateChange}
      hiddenInputs={
        <input
          type="hidden"
          name={CHORE_FORM_FIELD.DUE_DATE}
          value={date ? dateToChoreDateString(date) : ""}
        />
      }
    />
  );
}
