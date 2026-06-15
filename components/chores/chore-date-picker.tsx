"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToChoreDateString } from "@/lib/chores/types";
import { CHORE_RECURRENCE } from "@/lib/constants/chores";
import type { ChoreRecurrence } from "@/lib/constants/chores";

interface ChoreDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  recurrence: ChoreRecurrence | null;
}

export function ChoreDatePicker({ date, onDateChange, recurrence }: ChoreDatePickerProps) {
  const t = useT();
  const isRecurring = !!recurrence && recurrence !== CHORE_RECURRENCE.NONE;

  return (
    <DatePickerField
      label={isRecurring ? t.chores.dueDateRecurringLabel : t.chores.dueDateLabel}
      hint={isRecurring ? t.chores.dueDateRecurringHint : t.chores.dueDateHint}
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
