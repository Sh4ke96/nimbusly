"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import Link from "next/link";
import {
  buildFamilyCalendarEvents,
  FAMILY_CALENDAR_EVENT_KIND,
  groupFamilyCalendarEventsByDay,
  type FamilyCalendarEventKind,
} from "@/lib/calendar/family-calendar";
import {
  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
  MonthCalendarGrid,
  MonthCalendarNav,
} from "@/components/ui/month-calendar-grid";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const eventKindStyles: Record<FamilyCalendarEventKind, string> = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]:
    "bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/25",
  [FAMILY_CALENDAR_EVENT_KIND.SCHEDULE]:
    "bg-sky-500/15 text-sky-900 dark:text-sky-200 border-sky-500/25",
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]:
    "bg-teal-500/15 text-teal-900 dark:text-teal-200 border-teal-500/25",
};

export function FamilyCalendarView() {
  const t = useT();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  const birthdays = useBirthdaysStore((s) => s.entries);
  const birthdaysLoaded = useBirthdaysStore((s) => s.loaded);
  const birthdaysError = useBirthdaysStore((s) => s.error);
  const fetchBirthdays = useBirthdaysStore((s) => s.fetchEntries);
  const scheduleEntries = useScheduleStore((s) => s.entries);
  const scheduleLoaded = useScheduleStore((s) => s.loaded);
  const scheduleError = useScheduleStore((s) => s.error);
  const fetchSchedule = useScheduleStore((s) => s.fetchEntries);
  const choreTasks = useChoresStore((s) => s.tasks);
  const choresLoaded = useChoresStore((s) => s.loaded);
  const choresError = useChoresStore((s) => s.error);
  const fetchChores = useChoresStore((s) => s.fetchTasks);

  useStoreBootstrap(birthdaysLoaded, birthdaysError, fetchBirthdays);
  useStoreBootstrap(scheduleLoaded, scheduleError, fetchSchedule);
  useStoreBootstrap(choresLoaded, choresError, fetchChores);

  const events = useMemo(
    () =>
      buildFamilyCalendarEvents({
        year,
        month,
        birthdays,
        scheduleEntries,
        choreTasks,
      }),
    [year, month, birthdays, scheduleEntries, choreTasks]
  );

  const eventsByDay = useMemo(() => groupFamilyCalendarEventsByDay(events), [events]);
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekdays = getWeekdayLabels(t.birthdays.calendarWeekdays);
  const monthNames = t.birthdays.calendarMonths;

  function handlePrev() {
    const shifted = shiftMonth(year, month, -1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  function handleNext() {
    const shifted = shiftMonth(year, month, 1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 border border-rose-500/40 bg-rose-500/20" />
          {t.familyCalendar.legendBirthday}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 border border-sky-500/40 bg-sky-500/20" />
          {t.familyCalendar.legendSchedule}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 border border-teal-500/40 bg-teal-500/20" />
          {t.familyCalendar.legendChore}
        </span>
      </div>

      <MonthCalendarNav
        title={`${getMonthName(month, monthNames)} ${year}`}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <MonthCalendarGrid
        cells={cells}
        weekdays={weekdays}
        monthNames={monthNames}
        dayDataAttribute="family-calendar-day"
        renderDayContent={({ day }) => {
          if (!day) return null;
          const dayEvents = eventsByDay.get(day) ?? [];
          return (
            <ul className="space-y-1">
              {dayEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={event.href}
                    className={cn(
                      MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                      "border pointer-events-auto",
                      eventKindStyles[event.kind]
                    )}
                  >
                    <span className="line-clamp-2">{event.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          );
        }}
      />
    </div>
  );
}
