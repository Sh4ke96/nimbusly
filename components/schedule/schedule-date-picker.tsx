"use client";

import type { DateRange } from "react-day-picker";
import { SCHEDULE_FORM_FIELD } from "@/lib/schedule/types";
import { useT } from "@/lib/lang-context";
import { DateRangePickerField } from "@/components/ui/date-range-picker-field";
import { dateToEntryDateString } from "@/lib/schedule/types";

interface ScheduleDatePickerProps {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}

export function ScheduleDatePicker({ range, onRangeChange }: ScheduleDatePickerProps) {
  const t = useT();
  const startDate = range?.from ? dateToEntryDateString(range.from) : "";
  const endDate = range?.to
    ? dateToEntryDateString(range.to)
    : range?.from
      ? dateToEntryDateString(range.from)
      : "";

  return (
    <DateRangePickerField
      label={t.schedule.dateLabel}
      hint={t.schedule.dateHint}
      placeholder={t.schedule.pickDate}
      range={range}
      onRangeChange={onRangeChange}
      rangeSeparator={t.schedule.dateRangeSeparator}
      hiddenInputs={
        <>
          <input type="hidden" name={SCHEDULE_FORM_FIELD.ENTRY_DATE} value={startDate} />
          <input type="hidden" name={SCHEDULE_FORM_FIELD.ENTRY_END_DATE} value={endDate} />
        </>
      }
    />
  );
}
