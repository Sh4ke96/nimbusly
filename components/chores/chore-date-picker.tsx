"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateToChoreDateString } from "@/lib/chores/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface ChoreDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function ChoreDatePicker({ date, onDateChange }: ChoreDatePickerProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const [open, setOpen] = useState<boolean>(false);

  const displayLabel = date
    ? format(date, "d MMMM yyyy", { locale })
    : t.chores.pickDueDate;

  function handleSelect(selected: Date | undefined) {
    onDateChange(selected);
    if (selected) setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{t.chores.dueDateLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.chores.dueDateHint}</p>
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
        name="dueDate"
        value={date ? dateToChoreDateString(date) : ""}
      />
    </div>
  );
}
