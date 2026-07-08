"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
  MonthCalendarGrid,
  MonthCalendarNav,
} from "@/components/ui/month-calendar-grid";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import { birthdayDateKey, type BirthdayEntry } from "@/lib/birthdays/types";
import { getDisplayName } from "@/lib/profile";
import type { FamilyMember, Profile } from "@/lib/profile";
import { selectionPillClasses } from "@/lib/ui/selection-styles";
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
  onEntryEdit?: (entry: BirthdayEntry) => void;
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
  onEntryEdit,
  onDayClick,
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

  function getDayEntries(day: number): BirthdayEntry[] {
    return entriesByDay.get(birthdayDateKey(month, day)) ?? [];
  }

  function resolveEditEntry(day: number): BirthdayEntry | null {
    const dayEntries = getDayEntries(day);
    if (dayEntries.length === 0) return null;
    return dayEntries.find((entry) => entry.id === focusedEntryId) ?? dayEntries[0]!;
  }

  return (
    <div ref={calendarRef} className="space-y-4">
      <MonthCalendarNav
        title={`${getMonthName(month, t.birthdays.calendarMonths)} ${year}`}
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
        monthNames={t.birthdays.calendarMonths}
        dayDataAttribute="birthday-day"
        focusDay={focusedDay}
        isFocusedDay={(day) => focusedDay === day}
        hasFocusedItem={(day) =>
          getDayEntries(day).some((entry) => entry.id === focusedEntryId)
        }
        overlayCoversContent={(day) => getDayEntries(day).length > 0}
        renderDayOverlay={(day) => {
          const dayEntries = getDayEntries(day);

          if (dayEntries.length > 0) {
            const entry = resolveEditEntry(day);
            if (!entry || !onEntryEdit) return null;

            return (
              <button
                type="button"
                className="absolute inset-0 size-full cursor-pointer rounded-none hover:bg-muted/30 active:bg-muted/40"
                aria-label={formatMessage(t.birthdays.calendarEditOnDay, {
                  day: String(day),
                  name: entry.person_name,
                })}
                onClick={() => onEntryEdit(entry)}
              />
            );
          }

          if (!onDayClick) return null;

          return (
            <button
              type="button"
              className="absolute inset-0 size-full cursor-pointer rounded-none hover:bg-muted/30 active:bg-muted/40"
              aria-label={formatMessage(t.birthdays.calendarAddOnDay, {
                day: String(day),
              })}
              onClick={() => onDayClick(day)}
            />
          );
        }}
        renderDayContent={({ day }) => {
          const dayEntries = getDayEntries(day);

          return dayEntries.map((entry) => {
            const isSelected = entry.id === focusedEntryId;
            const creator = resolveCreatorName(entry.created_by, userId, profile, members);

            return (
              <div
                key={entry.id}
                className={cn(
                  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                  selectionPillClasses(isSelected)
                )}
              >
                <p className="truncate">{entry.person_name}</p>
                {isFamily && creator ? (
                  <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">
                    {t.birthdays.addedBy}: {creator}
                  </p>
                ) : null}
              </div>
            );
          });
        }}
      />
    </div>
  );
}
