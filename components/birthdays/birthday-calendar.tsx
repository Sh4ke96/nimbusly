"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import { birthdayDateKey, formatBirthdayLabel, type BirthdayEntry } from "@/lib/birthdays/types";
import { getDisplayName } from "@/lib/profile";
import type { FamilyMember, Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface BirthdayCalendarProps {
  year: number;
  month: number;
  entries: BirthdayEntry[];
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  focusedDay?: number | null;
  focusedEntryId?: string | null;
  onMonthChange: (year: number, month: number) => void;
  onEntrySelect?: (entry: BirthdayEntry) => void;
}

function resolveCreatorName(
  createdBy: string,
  userId: string | undefined,
  profile: Profile | null,
  members: FamilyMember[]
): string | null {
  if (!userId) return null;
  if (createdBy === userId && profile) return getDisplayName(profile);
  const member = members.find((m) => m.id === createdBy);
  return member ? getDisplayName(member) : null;
}

export function BirthdayCalendar({
  year,
  month,
  entries,
  profile,
  members,
  userId,
  focusedDay,
  focusedEntryId,
  onMonthChange,
  onEntrySelect,
}: BirthdayCalendarProps) {
  const t = useT();
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusedDay) return;
    const cell = calendarRef.current?.querySelector(`[data-birthday-day="${focusedDay}"]`);
    cell?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedDay, month, year]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>();
    for (const entry of entries) {
      const key = birthdayDateKey(entry.birth_month, entry.birth_day);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const cells = buildMonthGrid(year, month);
  const weekdays = getWeekdayLabels(t.birthdays.calendarWeekdays);

  return (
    <TooltipProvider>
      <div ref={calendarRef} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const next = shiftMonth(year, month, -1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-heading font-semibold text-lg">
            {getMonthName(month, t.birthdays.calendarMonths)} {year}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const next = shiftMonth(year, month, 1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px border border-border bg-border">
          {weekdays.map((label) => (
            <div
              key={label}
              className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {cells.map((cell, index) => {
            if (!cell.isCurrentMonth || cell.day === null) {
              return <div key={`empty-${index}`} className="min-h-24 bg-background" />;
            }

            const dayEntries = entriesByDay.get(birthdayDateKey(month, cell.day)) ?? [];
            const isFocusedDay = focusedDay === cell.day;
            const hasFocusedEntry = dayEntries.some((e) => e.id === focusedEntryId);

            return (
              <div
                key={`${month}-${cell.day}`}
                data-birthday-day={cell.day}
                className={cn(
                  "min-h-24 bg-background p-2 transition-all duration-200",
                  cell.isToday && !isFocusedDay && "shadow-[inset_0_0_0_1px] shadow-primary/30",
                  isFocusedDay &&
                  "bg-primary/4 shadow-[inset_0_0_0_2px] shadow-primary/50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center text-xs font-medium transition-colors",
                    isFocusedDay || hasFocusedEntry
                      ? "rounded-full bg-primary text-primary-foreground font-semibold"
                      : cell.isToday
                        ? "text-primary"
                        : "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEntries.map((entry) => {
                    const isSelected = entry.id === focusedEntryId;
                    const creator = resolveCreatorName(entry.created_by, userId, profile, members);
                    const tooltip = (
                      <div className="space-y-1 text-left">
                        <p className="font-semibold">{entry.person_name}</p>
                        <p>{formatBirthdayLabel(entry)}</p>
                        {entry.description && <p className="opacity-90">{entry.description}</p>}
                        {isFamily && creator && (
                          <p className="opacity-75">
                            {t.birthdays.addedBy}: {creator}
                          </p>
                        )}
                      </div>
                    );

                    return (
                      <Tooltip key={entry.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onEntrySelect?.(entry)}
                            className={cn(
                              "block w-full cursor-pointer truncate rounded-sm px-1.5 py-0.5 text-left text-[11px] font-medium transition-all duration-150",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                                : "bg-primary/10 text-primary hover:bg-primary/20 hover:ring-1 hover:ring-primary/20"
                            )}
                          >
                            {entry.person_name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {tooltip}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
