"use client";

import { BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";

/** Fixed year - only day/month matter when birth year is omitted. */
const CALENDAR_YEAR = 2000;

interface BirthdayDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  includeYear: boolean;
  onIncludeYearChange: (value: boolean) => void;
}

export function BirthdayDatePicker({
  date,
  onDateChange,
  includeYear,
  onIncludeYearChange,
}: BirthdayDatePickerProps) {
  const t = useT();

  const displayFormat = includeYear ? "d MMMM yyyy" : "d MMMM";
  const captionFormat = includeYear ? "MMMM yyyy" : "MMMM";
  const startMonth = includeYear
    ? new Date(1900, 0, 1)
    : new Date(CALENDAR_YEAR, 0, 1);
  const endMonth = includeYear
    ? new Date(new Date().getFullYear(), 11, 31)
    : new Date(CALENDAR_YEAR, 11, 31);
  const defaultMonth =
    date ??
    (includeYear
      ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      : new Date(CALENDAR_YEAR, new Date().getMonth(), 1));

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id="birthday-include-year"
          checked={includeYear}
          onCheckedChange={(checked) => onIncludeYearChange(checked === true)}
          className="cursor-pointer"
        />
        <div className="space-y-1">
          <Label htmlFor="birthday-include-year" className="cursor-pointer font-medium">
            {t.birthdays.includeBirthYearLabel}
          </Label>
          <p className="text-xs text-muted-foreground">{t.birthdays.includeBirthYearHint}</p>
        </div>
      </div>

      <DatePickerField
        label={t.birthdays.dateLabel}
        hint={includeYear ? t.birthdays.dateHintWithYear : t.birthdays.dateHint}
        placeholder={t.birthdays.pickDate}
        date={date}
        onDateChange={onDateChange}
        displayFormat={displayFormat}
        captionFormat={captionFormat}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth}
        onSelect={(selected) => {
          if (!selected) {
            onDateChange(undefined);
            return;
          }
          if (includeYear) {
            onDateChange(selected);
            return;
          }
          onDateChange(
            new Date(CALENDAR_YEAR, selected.getMonth(), selected.getDate())
          );
        }}
        hiddenInputs={
          <>
            <input
              type="hidden"
              name={BIRTHDAY_FORM_FIELD.INCLUDE_BIRTH_YEAR}
              value={includeYear ? "true" : "false"}
            />
            <input
              type="hidden"
              name={BIRTHDAY_FORM_FIELD.BIRTH_MONTH}
              value={date ? date.getMonth() + 1 : ""}
            />
            <input
              type="hidden"
              name={BIRTHDAY_FORM_FIELD.BIRTH_DAY}
              value={date ? date.getDate() : ""}
            />
            {includeYear && date ? (
              <input
                type="hidden"
                name={BIRTHDAY_FORM_FIELD.BIRTH_YEAR}
                value={date.getFullYear()}
              />
            ) : null}
          </>
        }
      />
    </div>
  );
}
