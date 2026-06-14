"use client";

import { BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";

/** Fixed year — only day/month matter for recurring birthdays. */
const CALENDAR_YEAR = 2000;

interface BirthdayDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function BirthdayDatePicker({ date, onDateChange }: BirthdayDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.birthdays.dateLabel}
      hint={t.birthdays.dateHint}
      placeholder={t.birthdays.pickDate}
      date={date}
      onDateChange={onDateChange}
      displayFormat="d MMMM"
      captionFormat="MMMM"
      startMonth={new Date(CALENDAR_YEAR, 0, 1)}
      endMonth={new Date(CALENDAR_YEAR, 11, 31)}
      defaultMonth={date ?? new Date(CALENDAR_YEAR, new Date().getMonth(), 1)}
      onSelect={(selected) => {
        if (!selected) {
          onDateChange(undefined);
          return;
        }
        onDateChange(
          new Date(CALENDAR_YEAR, selected.getMonth(), selected.getDate())
        );
      }}
      hiddenInputs={
        <>
          <input type="hidden" name={BIRTHDAY_FORM_FIELD.BIRTH_MONTH} value={date ? date.getMonth() + 1 : ""} />
          <input type="hidden" name={BIRTHDAY_FORM_FIELD.BIRTH_DAY} value={date ? date.getDate() : ""} />
        </>
      }
    />
  );
}
