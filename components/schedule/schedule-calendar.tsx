"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
  MonthCalendarGrid,
  MonthCalendarNav,
} from "@/components/ui/month-calendar-grid";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SCHEDULE_ENTRY_EMOJI } from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import {
  formatScheduleDateRangeLabel,
  getScheduleTypeLabel,
  scheduleDateKey,
  scheduleEntryIncludesDate,
  scheduleEntryOverlapsMonth,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { getDisplayName } from "@/lib/profile";
import type { FamilyMember, Profile } from "@/lib/profile";
import { selectionPillClasses } from "@/lib/ui/selection-styles";
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
  onDayClick?: (day: number) => void;
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
  return scheduleEntryOverlapsMonth(entry, year, month);
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
  onDayClick,
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
    const monthEntries = entries.filter((entry) => entryMatchesMonth(entry, year, month));

    for (const entry of monthEntries) {
      const lastDay = new Date(year, month, 0).getDate();
      for (let day = 1; day <= lastDay; day += 1) {
        const dateKey = scheduleDateKey(year, month, day);
        if (!scheduleEntryIncludesDate(entry, dateKey)) continue;
        const list = map.get(day) ?? [];
        list.push(entry);
        map.set(day, list);
      }
    }

    return map;
  }, [entries, year, month]);

  const cells = buildMonthGrid(year, month);
  const weekdays = getWeekdayLabels(t.schedule.calendarWeekdays);

  return (
    <TooltipProvider>
      <div ref={calendarRef} className="space-y-4">
        <MonthCalendarNav
          title={`${getMonthName(month, t.schedule.calendarMonths)} ${year}`}
          onPrev={() => {
            const next = shiftMonth(year, month, -1);
            onMonthChange(next.year, next.month);
          }}
          onNext={() => {
            const next = shiftMonth(year, month, 1);
            onMonthChange(next.year, next.month);
          }}
        />

        <MonthCalendarGrid
          cells={cells}
          weekdays={weekdays}
          monthNames={t.schedule.calendarMonths}
          dayDataAttribute="schedule-day"
          focusDay={focusedDay}
          isFocusedDay={(day) => focusedDay === day}
          hasFocusedItem={(day) =>
            (entriesByDay.get(day) ?? []).some((entry) => entry.id === focusedEntryId)
          }
          renderDayOverlay={
            onDayClick
              ? (day) => (
                  <button
                    type="button"
                    className="absolute inset-0 z-0 cursor-pointer rounded-none hover:bg-muted/30"
                    aria-label={formatMessage(t.schedule.calendarAddOnDay, {
                      day: String(day),
                    })}
                    onClick={() => onDayClick(day)}
                  />
                )
              : undefined
          }
          renderDayContent={({ day }) => {
            const dayEntries = entriesByDay.get(day) ?? [];

            return dayEntries.map((entry) => {
              const isSelected = entry.id === focusedEntryId;
              const creator = resolveCreatorName(entry.created_by, userId, profile, members);
              const typeLabel = getScheduleTypeLabel(entry.entry_type, t.schedule.typeLabels);

              const tooltip = (
                <div className="space-y-1 text-left">
                  <p className="font-semibold">
                    {SCHEDULE_ENTRY_EMOJI[entry.entry_type]} {typeLabel}
                  </p>
                  <p>
                    {formatScheduleDateRangeLabel(
                      entry.entry_date,
                      entry.entry_end_date,
                      t.schedule.dateRangeSeparator
                    )}
                  </p>
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
                        MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                        "flex items-center gap-1",
                        selectionPillClasses(isSelected)
                      )}
                    >
                      <span className="shrink-0 text-sm leading-none" aria-hidden>
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
            });
          }}
        />
      </div>
    </TooltipProvider>
  );
}
