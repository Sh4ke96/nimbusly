"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateToMedicineDateString } from "@/lib/medicine/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface MedicineDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  showHint?: boolean;
}

export function MedicineDatePicker({
  date,
  onDateChange,
  showHint = true,
}: MedicineDatePickerProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const [open, setOpen] = useState<boolean>(false);

  const displayLabel = date
    ? format(date, "d MMMM yyyy", { locale })
    : t.medicineCabinet.pickExpiryDate;

  function handleSelect(selected: Date | undefined) {
    onDateChange(selected);
    if (selected) setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{t.medicineCabinet.expiryLabel}</Label>
      {showHint && (
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.expiryHint}</p>
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
        name="expiryDate"
        value={date ? dateToMedicineDateString(date) : ""}
      />
    </div>
  );
}
