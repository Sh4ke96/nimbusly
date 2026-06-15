"use client";

import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import type { Matcher } from "react-day-picker";

export interface DateRangePickerFieldProps {
  label: string;
  hint?: string;
  placeholder: string;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  rangeSeparator: string;
  displayFormat?: string;
  captionFormat?: string;
  hiddenInputs?: ReactNode;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  disabled?: Matcher | Matcher[];
}

function formatRangeLabel(
  range: DateRange | undefined,
  placeholder: string,
  displayFormat: string,
  rangeSeparator: string,
  locale: ReturnType<typeof getDateFnsLocale>
): string {
  if (!range?.from) return placeholder;
  const fromLabel = format(range.from, displayFormat, { locale });
  if (!range.to || range.to.getTime() === range.from.getTime()) {
    return fromLabel;
  }
  const toLabel = format(range.to, displayFormat, { locale });
  return `${fromLabel}${rangeSeparator}${toLabel}`;
}

export function DateRangePickerField({
  label,
  hint,
  placeholder,
  range,
  onRangeChange,
  rangeSeparator,
  displayFormat = "d MMMM yyyy",
  captionFormat = "MMMM yyyy",
  hiddenInputs,
  startMonth,
  endMonth,
  defaultMonth,
  disabled,
}: DateRangePickerFieldProps) {
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const [open, setOpen] = useState<boolean>(false);

  const displayLabel = formatRangeLabel(
    range,
    placeholder,
    displayFormat,
    rangeSeparator,
    locale
  );

  function handleSelect(selected: DateRange | undefined) {
    onRangeChange(selected);
    if (selected?.from && selected.to) {
      setOpen(false);
    }
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
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {displayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-none p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            locale={locale}
            captionLayout="label"
            numberOfMonths={1}
            formatters={{
              formatCaption: (month) => format(month, captionFormat, { locale }),
            }}
            startMonth={startMonth}
            endMonth={endMonth}
            defaultMonth={defaultMonth ?? range?.from ?? new Date()}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      {hiddenInputs}
    </div>
  );
}
