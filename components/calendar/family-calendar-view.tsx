"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import Link from "next/link";
import {
  buildFamilyCalendarEvents,
  FAMILY_CALENDAR_EVENT_KIND,
  groupFamilyCalendarEventsByDay,
} from "@/lib/calendar/family-calendar";
import {
  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
  MonthCalendarGrid,
  MonthCalendarNav,
} from "@/components/ui/month-calendar-grid";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import {
  familyCalendarEventStyles,
  familyCalendarLegendStyles,
} from "@/lib/ui/status-badge-styles";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { CalendarRange } from "lucide-react";

const eventKindStyles = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: familyCalendarEventStyles.birthday,
  [FAMILY_CALENDAR_EVENT_KIND.SCHEDULE]: familyCalendarEventStyles.schedule,
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]: familyCalendarEventStyles.chore,
};

const legendStyles = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: familyCalendarLegendStyles.birthday,
  [FAMILY_CALENDAR_EVENT_KIND.SCHEDULE]: familyCalendarLegendStyles.schedule,
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]: familyCalendarLegendStyles.chore,
};

export function FamilyCalendarView() {
  const t = useT();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  const birthdays = useBirthdaysStore((s) => s.entries);
  const birthdaysLoaded = useBirthdaysStore((s) => s.loaded);
  const birthdaysLoading = useBirthdaysStore((s) => s.loading);
  const birthdaysError = useBirthdaysStore((s) => s.error);
  const fetchBirthdays = useBirthdaysStore((s) => s.fetchEntries);
  const scheduleEntries = useScheduleStore((s) => s.entries);
  const scheduleLoaded = useScheduleStore((s) => s.loaded);
  const scheduleLoading = useScheduleStore((s) => s.loading);
  const scheduleError = useScheduleStore((s) => s.error);
  const fetchSchedule = useScheduleStore((s) => s.fetchEntries);
  const choreTasks = useChoresStore((s) => s.tasks);
  const choresLoaded = useChoresStore((s) => s.loaded);
  const choresLoading = useChoresStore((s) => s.loading);
  const choresError = useChoresStore((s) => s.error);
  const fetchChores = useChoresStore((s) => s.fetchTasks);

  useStoreBootstrap(birthdaysLoaded, birthdaysError, fetchBirthdays);
  useStoreBootstrap(scheduleLoaded, scheduleError, fetchSchedule);
  useStoreBootstrap(choresLoaded, choresError, fetchChores);

  const hasError = birthdaysError || scheduleError || choresError;
  const isLoading =
    (!birthdaysLoaded && birthdaysLoading) ||
    (!scheduleLoaded && scheduleLoading) ||
    (!choresLoaded && choresLoading);

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

  function handleRetry() {
    if (birthdaysError) void fetchBirthdays(true);
    if (scheduleError) void fetchSchedule(true);
    if (choresError) void fetchChores(true);
  }

  if (hasError) {
    return <ModuleFetchError onRetry={handleRetry} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-none" />
        <Skeleton className="h-80 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-nimbus-tour="family-calendar-view">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY])} />
          {t.familyCalendar.legendBirthday}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[FAMILY_CALENDAR_EVENT_KIND.SCHEDULE])} />
          {t.familyCalendar.legendSchedule}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[FAMILY_CALENDAR_EVENT_KIND.CHORE])} />
          {t.familyCalendar.legendChore}
        </span>
      </div>

      <MonthCalendarNav
        title={`${getMonthName(month, monthNames)} ${year}`}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {events.length === 0 ? (
        <ModuleEmptyState icon={CalendarRange} message={t.familyCalendar.empty} />
      ) : (
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
      )}
    </div>
  );
}
