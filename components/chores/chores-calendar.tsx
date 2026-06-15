"use client";

import { useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChoreOccurrenceCompleteButton } from "@/components/chores/chore-occurrence-complete-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
            {getMonthName(month, t.chores.calendarMonths)} {year}
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

            const dayOccurrences = occurrencesByDay.get(cell.day) ?? [];
            const isFocusedDay = focusedDay === cell.day;
            const hasFocusedTask = dayOccurrences.some((o) => o.taskId === focusedTaskId);

            return (
              <div
                key={choreDateKey(year, month, cell.day)}
                data-chore-day={cell.day}
                className={cn(
                  "min-h-24 bg-background p-1.5 transition-all duration-200",
                  cell.isToday && !isFocusedDay && "shadow-[inset_0_0_0_1px] shadow-primary/30",
                  isFocusedDay && "bg-primary/4 shadow-[inset_0_0_0_2px] shadow-primary/50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center text-xs font-medium transition-colors",
                    isFocusedDay || hasFocusedTask
                      ? "rounded-full bg-primary text-primary-foreground font-semibold"
                      : cell.isToday
                        ? "text-primary"
                        : "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayOccurrences.map((occurrence) => {
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
                              "flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-sm px-1 py-0.5 text-left text-[10px] font-medium leading-tight transition-all duration-150",
                              occurrence.isCompleted
                                ? "bg-primary/15 text-primary line-through decoration-primary/50"
                                : occurrence.isNextDue
                                  ? "bg-sky-500/15 text-sky-900 dark:text-sky-200"
                                  : "bg-muted/40 text-foreground/80",
                              selectionPillClasses(isSelected)
                            )}
                          >
                            <span className="min-w-0 truncate">
                              {occurrence.iconEmoji ? (
                                <span className="mr-0.5" aria-hidden>
                                  {occurrence.iconEmoji}
                                </span>
                              ) : null}
                              {occurrence.title}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2 text-left">
                            <p className="font-semibold">
                              {occurrence.iconEmoji ? `${occurrence.iconEmoji} ` : ""}
                              {occurrence.title}
                            </p>
                            {schedule && <p className="text-xs">{schedule}</p>}
                            <p className="text-xs text-background/70">
                              {formatIsoDate(occurrence.date, locale)}
                            </p>
                            {occurrence.isCompleted && (
                              <p className="text-xs font-semibold">
                                {t.chores.occurrenceCompletedLabel}
                              </p>
                            )}
                            {occurrence.isNextDue && !occurrence.isCompleted && (
                              <p className="text-xs text-background/80">{t.chores.calendarNextDue}</p>
                            )}
                            {canComplete && !occurrence.isCompleted && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <ChoreOccurrenceCompleteButton
                                  taskId={occurrence.taskId}
                                  occurrenceDate={occurrence.date}
                                  variant="default"
                                  onSuccess={onChanged}
                                />
                              </div>
                            )}
                          </div>
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
