"use client";

import { format } from "date-fns";
import { enUS, pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLang, useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BirthdayDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

/** Fixed year — only day/month matter for recurring birthdays. */
const CALENDAR_YEAR = 2000;

export function BirthdayDatePicker({ date, onDateChange }: BirthdayDatePickerProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "pl" ? pl : enUS;

  const displayLabel = date
    ? format(date, "d MMMM", { locale })
    : t.birthdays.pickDate;

  function handleSelect(selected: Date | undefined) {
    if (!selected) {
      onDateChange(undefined);
      return;
    }
    onDateChange(
      new Date(CALENDAR_YEAR, selected.getMonth(), selected.getDate())
    );
  }

  return (
    <div className="space-y-1.5">
      <Label>{t.birthdays.dateLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.birthdays.dateHint}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start rounded-none font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {displayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-none p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={locale}
            captionLayout="dropdown-months"
            startMonth={new Date(CALENDAR_YEAR, 0, 1)}
            endMonth={new Date(CALENDAR_YEAR, 11, 31)}
            defaultMonth={date ?? new Date(CALENDAR_YEAR, new Date().getMonth(), 1)}
          />
        </PopoverContent>
      </Popover>

      <input type="hidden" name="birthMonth" value={date ? date.getMonth() + 1 : ""} />
      <input type="hidden" name="birthDay" value={date ? date.getDate() : ""} />
    </div>
  );
}
