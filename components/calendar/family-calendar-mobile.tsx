"use client";

import Link from "next/link";
import type { CalendarCell } from "@/lib/birthdays/calendar";
import {
  FAMILY_CALENDAR_EVENT_KIND,
  type FamilyCalendarEvent,
  type FamilyCalendarEventKind,
} from "@/lib/calendar/family-calendar";
import { SCHEDULE_ENTRY_TYPES } from "@/lib/constants/schedule";
import { getScheduleEntryIcon } from "@/lib/schedule/entry-icons";
import { getScheduleTypeLabel } from "@/lib/schedule/types";
import {
  scheduleEntryBarStyles,
  scheduleEntryLegendStyles,
} from "@/lib/ui/schedule-entry-bar-styles";
import { familyCalendarLegendStyles } from "@/lib/ui/status-badge-styles";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const MOBILE_KIND_BAR_STYLES: Record<
  Exclude<FamilyCalendarEventKind, typeof FAMILY_CALENDAR_EVENT_KIND.SCHEDULE>,
  string
> = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: "bg-rose-500",
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]: "bg-teal-500",
};

const MAIN_LEGEND_ITEMS = [
  FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY,
  FAMILY_CALENDAR_EVENT_KIND.CHORE,
] as const;

function getFamilyCalendarEventBarClass(event: FamilyCalendarEvent): string {
  if (
    event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE &&
    event.scheduleEntryType
  ) {
    return scheduleEntryBarStyles[event.scheduleEntryType];
  }

  if (event.kind === FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY) {
    return MOBILE_KIND_BAR_STYLES[FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY];
  }

  return MOBILE_KIND_BAR_STYLES[FAMILY_CALENDAR_EVENT_KIND.CHORE];
}

interface FamilyCalendarMobileMonthProps {
  cells: CalendarCell[];
  weekdays: readonly string[];
  eventsByDay: Map<number, FamilyCalendarEvent[]>;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export function FamilyCalendarMobileMonth({
  cells,
  weekdays,
  eventsByDay,
  selectedDay,
  onSelectDay,
}: FamilyCalendarMobileMonthProps) {
  return (
    <div className="md:hidden">
      <div className="grid grid-cols-7 border border-border bg-border gap-px">
        {weekdays.map((label) => (
          <div
            key={label}
            className="bg-muted/50 px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell.isCurrentMonth || cell.day === null) {
            return (
              <div
                key={`pad-${index}`}
                className="min-h-14 bg-background/40"
                aria-hidden
              />
            );
          }

          const day = cell.day;
          const dayEvents = eventsByDay.get(day) ?? [];
          const isSelected = selectedDay === day;

          return (
            <button
              key={`${cell.month}-${day}`}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-14 flex-col bg-background px-1 py-1.5 text-left transition-colors",
                cell.isToday && !isSelected && "bg-primary/5",
                isSelected && "bg-primary/10 ring-2 ring-inset ring-primary"
              )}
              aria-pressed={isSelected}
              aria-label={String(day)}
            >
              <span
                className={cn(
                  "mb-1 inline-flex size-6 items-center justify-center text-xs font-semibold tabular-nums",
                  cell.isToday && "rounded-full bg-primary text-primary-foreground",
                  isSelected && !cell.isToday && "text-primary"
                )}
              >
                {day}
              </span>
              <div className="mt-auto flex w-full flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={cn("h-1 w-full rounded-full", getFamilyCalendarEventBarClass(event))}
                    aria-hidden
                  />
                ))}
                {dayEvents.length > 3 ? (
                  <span className="h-0.5 w-full rounded-full bg-muted-foreground/40" aria-hidden />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FamilyCalendarMobileLegend() {
  const t = useT();

  const labels: Record<(typeof MAIN_LEGEND_ITEMS)[number], string> = {
    [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: t.familyCalendar.legendBirthday,
    [FAMILY_CALENDAR_EVENT_KIND.CHORE]: t.familyCalendar.legendChore,
  };

  const legendStyles: Record<(typeof MAIN_LEGEND_ITEMS)[number], string> = {
    [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: familyCalendarLegendStyles.birthday,
    [FAMILY_CALENDAR_EVENT_KIND.CHORE]: familyCalendarLegendStyles.chore,
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground md:hidden">
      {MAIN_LEGEND_ITEMS.map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", legendStyles[kind])} aria-hidden />
          {labels[kind]}
        </span>
      ))}
      {SCHEDULE_ENTRY_TYPES.map((type) => (
        <span key={type} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 border", scheduleEntryLegendStyles[type])} aria-hidden />
          {getScheduleTypeLabel(type, t.schedule.typeLabels)}
        </span>
      ))}
    </div>
  );
}

interface FamilyCalendarDayListProps {
  year: number;
  month: number;
  day: number | null;
  events: FamilyCalendarEvent[];
  weekdaysFull: readonly string[];
}

export function FamilyCalendarDayList({
  year,
  month,
  day,
  events,
  weekdaysFull,
}: FamilyCalendarDayListProps) {
  const t = useT();

  if (day === null) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const weekdayIndex = (date.getDay() + 6) % 7;
  const heading = `${day} ${weekdaysFull[weekdayIndex]?.toUpperCase() ?? ""}`;

  return (
    <section className="space-y-3 md:hidden">
      <h3 className="font-heading text-sm font-semibold tracking-tight">{heading}</h3>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.familyCalendar.noEventsOnDay}</p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {events.map((event) => {
            const ScheduleIcon =
              event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE && event.scheduleEntryType
                ? getScheduleEntryIcon(event.scheduleEntryType)
                : null;
            const scheduleTypeLabel =
              event.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE && event.scheduleEntryType
                ? getScheduleTypeLabel(event.scheduleEntryType, t.schedule.typeLabels)
                : null;

            return (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="flex items-stretch gap-3 px-3 py-3 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={cn("w-1 shrink-0 rounded-full", getFamilyCalendarEventBarClass(event))}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    {scheduleTypeLabel && ScheduleIcon ? (
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ScheduleIcon className="size-3.5 shrink-0" aria-hidden />
                        {scheduleTypeLabel}
                      </span>
                    ) : null}
                    <span className="block text-sm font-medium">{event.label}</span>
                    {event.detail ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{event.detail}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
