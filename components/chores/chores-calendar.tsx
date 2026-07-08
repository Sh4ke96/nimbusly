"use client";

import { useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { ChoreOccurrenceCompleteButton } from "@/components/chores/chore-occurrence-complete-button";
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
import {
  choreDateKey,
  getChoreOccurrencesInMonth,
  groupChoreOccurrencesByDay,
  type ChoreCalendarOccurrence,
} from "@/lib/chores/calendar";
import { formatChoreScheduleLabel } from "@/lib/chores/recurrence";
import type { ChoreTask } from "@/lib/chores/types";
import { parseChoreDateString } from "@/lib/chores/types";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { formatMessage } from "@/lib/i18n/format";
import { useLang, useT } from "@/lib/lang-context";
import type { Profile } from "@/lib/profile";
import { selectionPillClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";

interface ChoresCalendarProps {
  year: number;
  month: number;
  tasks: ChoreTask[];
  profile: Profile | null;
  userId: string | undefined;
  focusedDay?: number | null;
  focusedTaskId?: string | null;
  onMonthChange: (year: number, month: number) => void;
  onOccurrenceSelect?: (occurrence: ChoreCalendarOccurrence) => void;
  onDayClick?: (day: number) => void;
  onChanged?: () => void;
}

function formatIsoDate(
  iso: string,
  locale: ReturnType<typeof getDateFnsLocale>
): string {
  const parsed = parseChoreDateString(iso);
  if (!parsed) return iso;
  return format(parsed, "d MMM yyyy", { locale });
}

function canCompleteChoreTask(
  task: ChoreTask,
  userId: string | undefined,
  profile: Profile | null
): boolean {
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  return task.created_by === userId || isFamily;
}

export function ChoresCalendar({
  year,
  month,
  tasks,
  profile,
  userId,
  focusedDay,
  focusedTaskId,
  onMonthChange,
  onOccurrenceSelect,
  onDayClick,
  onChanged,
}: ChoresCalendarProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusedDay) return;
    const cell = calendarRef.current?.querySelector(`[data-chore-day="${focusedDay}"]`);
    cell?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedDay, month, year]);

  const monthOccurrences = useMemo(
    () => getChoreOccurrencesInMonth(tasks, year, month),
    [tasks, year, month]
  );

  const occurrencesByDay = useMemo(
    () => groupChoreOccurrencesByDay(monthOccurrences),
    [monthOccurrences]
  );

  const cells = buildMonthGrid(year, month);
  const weekdays = getWeekdayLabels(t.chores.calendarWeekdays);

  return (
    <TooltipProvider>
      <div ref={calendarRef} className="space-y-4">
        <MonthCalendarNav
          title={`${getMonthName(month, t.chores.calendarMonths)} ${year}`}
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
          monthNames={t.chores.calendarMonths}
          dayDataAttribute="chore-day"
          focusDay={focusedDay}
          isFocusedDay={(day) => focusedDay === day}
          hasFocusedItem={(day) =>
            (occurrencesByDay.get(day) ?? []).some((occurrence) => occurrence.taskId === focusedTaskId)
          }
          renderDayOverlay={
            onDayClick
              ? (day) => (
                  <button
                    type="button"
                    className="absolute inset-0 z-0 cursor-pointer rounded-none hover:bg-muted/30"
                    aria-label={formatMessage(t.chores.calendarAddOnDay, {
                      day: String(day),
                    })}
                    onClick={() => onDayClick(day)}
                  />
                )
              : undefined
          }
          renderDayContent={({ day }) => {
            const dayOccurrences = occurrencesByDay.get(day) ?? [];

            return dayOccurrences.map((occurrence) => {
              const task = tasks.find((item) => item.id === occurrence.taskId);
              const isSelected = occurrence.taskId === focusedTaskId;
              const schedule =
                task &&
                formatChoreScheduleLabel(task, t.chores, (iso) =>
                  formatIsoDate(iso, locale)
                );
              const canComplete =
                !!task && canCompleteChoreTask(task, userId, profile);

              return (
                <Tooltip key={`${occurrence.taskId}-${occurrence.date}`}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onOccurrenceSelect?.(occurrence)}
                      className={cn(
                        MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                        "flex items-center gap-1",
                        occurrence.isCompleted
                          ? "bg-primary/15 text-primary line-through decoration-primary/50"
                          : occurrence.isNextDue
                            ? "bg-sky-500/15 text-sky-900 dark:text-sky-200"
                            : "bg-muted/50 text-foreground",
                        selectionPillClasses(isSelected)
                      )}
                    >
                      {occurrence.iconEmoji ? (
                        <span className="shrink-0" aria-hidden>
                          {occurrence.iconEmoji}
                        </span>
                      ) : null}
                      <span className="min-w-0 truncate">{occurrence.title}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2 text-left">
                      <p className="font-semibold">
                        {occurrence.iconEmoji ? `${occurrence.iconEmoji} ` : ""}
                        {occurrence.title}
                      </p>
                      {schedule && <p className="text-xs opacity-90">{schedule}</p>}
                      <p className="text-xs opacity-80">
                        {formatIsoDate(occurrence.date, locale)}
                      </p>
                      {occurrence.isCompleted && (
                        <p className="text-xs font-semibold">
                          {t.chores.occurrenceCompletedLabel}
                        </p>
                      )}
                      {occurrence.isNextDue && !occurrence.isCompleted && (
                        <p className="text-xs opacity-90">{t.chores.calendarNextDue}</p>
                      )}
                      {canComplete && !occurrence.isCompleted && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <ChoreOccurrenceCompleteButton
                            taskId={occurrence.taskId}
                            occurrenceDate={occurrence.date}
                            appearance="inline"
                            onSuccess={onChanged}
                          />
                        </div>
                      )}
                    </div>
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
