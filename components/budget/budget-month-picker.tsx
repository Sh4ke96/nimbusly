"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthKeyLabel, shiftMonthKey } from "@/lib/budget/monthly";
import { useT } from "@/lib/lang-context";

interface BudgetMonthPickerProps {
  value: string;
  onChange: (monthKey: string) => void;
}

export function BudgetMonthPicker({ value, onChange }: BudgetMonthPickerProps) {
  const t = useT();
  const label = formatMonthKeyLabel(value, t.birthdays.calendarMonths);

  return (
    <div className="flex items-center justify-between gap-2 border border-border bg-card px-2 py-2 shadow-sm sm:px-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="cursor-pointer shrink-0"
        onClick={() => onChange(shiftMonthKey(value, -1))}
        aria-label={t.budget.monthPrevious}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="text-center min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t.budget.monthlySummaryHeading}
        </p>
        <p className="font-heading font-semibold text-sm truncate">{label}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="cursor-pointer shrink-0"
        onClick={() => onChange(shiftMonthKey(value, 1))}
        aria-label={t.budget.monthNext}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
