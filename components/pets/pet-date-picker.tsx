"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateToPetDateString } from "@/lib/pets/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

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
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const [open, setOpen] = useState<boolean>(false);

  const displayLabel = date
    ? format(date, "d MMMM yyyy", { locale })
    : pickLabel;

  function handleSelect(selected: Date | undefined) {
    onDateChange(selected);
    if (selected) setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {showHint && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
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
              formatCaption: (month) => format(month, "MMMM yyyy", { locale }),
            }}
            defaultMonth={date ?? new Date()}
          />
        </PopoverContent>
      </Popover>

      <input
        type="hidden"
        name={name}
        value={date ? dateToPetDateString(date) : ""}
      />
    </div>
  );
}
