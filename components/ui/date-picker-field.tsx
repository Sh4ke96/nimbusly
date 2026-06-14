"use client";

import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import type { Matcher } from "react-day-picker";

export interface DatePickerFieldProps {
  label: string;
  hint?: string;
  placeholder: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  displayFormat?: string;
  captionFormat?: string;
  hiddenInputs?: ReactNode;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  closeOnSelect?: boolean;
  onSelect?: (selected: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
}

export function DatePickerField({
  label,
  hint,
  placeholder,
  date,
  onDateChange,
  displayFormat = "d MMMM yyyy",
  captionFormat = "MMMM yyyy",
  hiddenInputs,
  startMonth,
  endMonth,
  defaultMonth,
  closeOnSelect = true,
  onSelect,
  disabled,
}: DatePickerFieldProps) {
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const [open, setOpen] = useState<boolean>(false);

  const displayLabel = date
    ? format(date, displayFormat, { locale })
    : placeholder;

  function handleSelect(selected: Date | undefined) {
    if (onSelect) {
      onSelect(selected);
    } else {
      onDateChange(selected);
    }
    if (selected && closeOnSelect) setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <Popover open={open} onOpenChange={setOpen}>
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
            captionLayout="label"
            formatters={{
              formatCaption: (month) => format(month, captionFormat, { locale }),
            }}
            startMonth={startMonth}
            endMonth={endMonth}
            defaultMonth={defaultMonth ?? date ?? new Date()}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      {hiddenInputs}
    </div>
  );
}
