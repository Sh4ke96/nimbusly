"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import Link from "next/link";
import {
  FamilyCalendarDayList,
  FamilyCalendarMobileLegend,
  FamilyCalendarMobileMonth,
} from "@/components/calendar/family-calendar-mobile";
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
import { getScheduleEntryIcon } from "@/lib/schedule/entry-icons";
import { SCHEDULE_ENTRY_TYPES } from "@/lib/constants/schedule";
import { getScheduleTypeLabel } from "@/lib/schedule/types";
import {
  familyCalendarEventStyles,
  familyCalendarLegendStyles,
} from "@/lib/ui/status-badge-styles";
import { scheduleEntryLegendStyles } from "@/lib/ui/schedule-entry-bar-styles";
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

function resolveDefaultSelectedDay(
  year: number,
  month: number,
  eventsByDay: Map<number, unknown>
): number {
  const now = new Date();
  if (now.getFullYear() === year && now.getMonth() + 1 === month) {
    return now.getDate();
  }

  const firstWithEvents = [...eventsByDay.keys()].sort((a, b) => a - b)[0];
  return firstWithEvents ?? 1;
}

export function FamilyCalendarView() {
  const t = useT();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

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
  const weekdaysFull = t.common.calendarWeekdaysFull;
  const selectedDayEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  function shiftMonthView(delta: number) {
    const shifted = shiftMonth(year, month, delta);
    const nextEvents = buildFamilyCalendarEvents({
      year: shifted.year,
      month: shifted.month,
      birthdays,
      scheduleEntries,
      choreTasks,
    });
    const nextByDay = groupFamilyCalendarEventsByDay(nextEvents);
    setYear(shifted.year);
    setMonth(shifted.month);
    setSelectedDay(resolveDefaultSelectedDay(shifted.year, shifted.month, nextByDay));
  }

  function handlePrev() {
    shiftMonthView(-1);
  }

  function handleNext() {
    shiftMonthView(1);
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
      <div className="hidden flex-wrap items-center gap-3 text-xs text-muted-foreground md:flex">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY])} />
          {t.familyCalendar.legendBirthday}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[FAMILY_CALENDAR_EVENT_KIND.CHORE])} />
          {t.familyCalendar.legendChore}
        </span>
        {SCHEDULE_ENTRY_TYPES.map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 border", scheduleEntryLegendStyles[type])} aria-hidden />
            {getScheduleTypeLabel(type, t.schedule.typeLabels)}
          </span>
        ))}
      </div>

      <MonthCalendarNav
        title={`${getMonthName(month, monthNames)} ${year}`}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <FamilyCalendarMobileMonth
        cells={cells}
        weekdays={weekdays}
        eventsByDay={eventsByDay}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <FamilyCalendarMobileLegend />

      {events.length === 0 ? (
        <ModuleEmptyState icon={CalendarRange} message={t.familyCalendar.empty} />
      ) : (
        <FamilyCalendarDayList
          year={year}
          month={month}
          day={selectedDay}
          events={selectedDayEvents}
          weekdaysFull={weekdaysFull}
        />
      )}

      <div className="hidden md:block">
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
                  {dayEvents.map((event) => {
                    const ScheduleIcon =
                      event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE &&
                      event.scheduleEntryType
                        ? getScheduleEntryIcon(event.scheduleEntryType)
                        : null;
                    const scheduleTypeLabel =
                      event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE &&
                      event.scheduleEntryType
                        ? getScheduleTypeLabel(event.scheduleEntryType, t.schedule.typeLabels)
                        : null;

                    return (
                      <li key={event.id}>
                        <Link
                          href={event.href}
                          className={cn(
                            MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                            "border pointer-events-auto flex items-start gap-2",
                            event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE &&
                              event.scheduleEntryType
                              ? "border-sky-500/25 bg-sky-500/10"
                              : eventKindStyles[event.kind]
                          )}
                        >
                          {ScheduleIcon ? (
                            <ScheduleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          ) : null}
                          <span className="min-w-0">
                            {scheduleTypeLabel ? (
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {scheduleTypeLabel}
                              </span>
                            ) : null}
                            <span className="line-clamp-2">{event.label}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
