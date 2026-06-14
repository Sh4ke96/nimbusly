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
import { SCHEDULE_ENTRY_EMOJI } from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import {
  formatScheduleDateLabel,
  getScheduleTypeLabel,
  parseEntryDateParts,
  scheduleDateKey,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { getDisplayName } from "@/lib/profile";
import type { FamilyMember, Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  focusedDay?: number | null;
  focusedEntryId?: string | null;
  onMonthChange: (year: number, month: number) => void;
  onEntrySelect?: (entry: ScheduleEntry) => void;
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

function entryMatchesMonth(entry: ScheduleEntry, year: number, month: number): boolean {
  const parts = parseEntryDateParts(entry.entry_date);
  return parts.year === year && parts.month === month;
}

export function ScheduleCalendar({
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
}: ScheduleCalendarProps) {
  const t = useT();
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusedDay) return;
    const cell = calendarRef.current?.querySelector(`[data-schedule-day="${focusedDay}"]`);
    cell?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedDay, month, year]);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, ScheduleEntry[]>();
    for (const entry of entries) {
      if (!entryMatchesMonth(entry, year, month)) continue;
      const { day } = parseEntryDateParts(entry.entry_date);
      const list = map.get(day) ?? [];
      list.push(entry);
      map.set(day, list);
    }
    return map;
  }, [entries, year, month]);

  const cells = buildMonthGrid(year, month);
  const weekdays = getWeekdayLabels(t.schedule.calendarWeekdays);

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
            {getMonthName(month, t.schedule.calendarMonths)} {year}
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
              return <div key={`empty-${index}`} className="min-h-28 bg-background" />;
            }

            const dayEntries = entriesByDay.get(cell.day) ?? [];
            const isFocusedDay = focusedDay === cell.day;
            const hasFocusedEntry = dayEntries.some((e) => e.id === focusedEntryId);

            return (
              <div
                key={scheduleDateKey(year, month, cell.day)}
                data-schedule-day={cell.day}
                className={cn(
                  "min-h-28 bg-background p-2 transition-all duration-200",
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
                    const typeLabel = getScheduleTypeLabel(entry.entry_type, t.schedule.typeLabels);

                    const tooltip = (
                      <div className="space-y-1 text-left">
                        <p className="font-semibold">
                          {SCHEDULE_ENTRY_EMOJI[entry.entry_type]} {typeLabel}
                        </p>
                        <p>{formatScheduleDateLabel(entry.entry_date)}</p>
                        {entry.description && (
                          <p>
                            <span className="font-medium">{t.schedule.reasonLabel}:</span>{" "}
                            {entry.description}
                          </p>
                        )}
                        {isFamily && creator && (
                          <p className="opacity-75">
                            {t.schedule.addedBy}: {creator}
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
                              "flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 text-left text-[11px] font-medium leading-none transition-all duration-150",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                                : "bg-primary/10 text-primary hover:bg-primary/20 hover:ring-1 hover:ring-primary/20"
                            )}
                          >
                            <span
                              className="shrink-0 text-xs leading-none"
                              aria-hidden
                            >
                              {SCHEDULE_ENTRY_EMOJI[entry.entry_type]}
                            </span>
                            <span className="min-w-0 truncate">{typeLabel}</span>
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
