"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarCell } from "@/lib/birthdays/calendar";
import {
  chunkCalendarWeeks,
  findDefaultWeekIndex,
  formatCalendarDayLabel,
  formatWeekDayRangeLabel,
} from "@/lib/birthdays/calendar";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export const MONTH_CALENDAR_ENTRY_BUTTON_CLASS = cn(
  "block w-full min-w-0 cursor-pointer rounded-none px-2 py-1.5 text-left",
  "text-[11px] font-medium md:text-[11px]",
  "max-md:rounded-none max-md:px-3 max-md:py-2.5 max-md:text-sm max-md:font-semibold"
);

type MonthCalendarNavProps = {
  title: string;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthCalendarNav({ title, onPrev, onNext }: MonthCalendarNavProps) {
  const t = useT();

  return (
    <div className="flex items-center justify-between gap-3">
      <Button type="button" variant="outline" size="icon" onClick={onPrev} aria-label={t.calendar.prevMonth}>
        <ChevronLeft className="size-4" />
      </Button>
      <h2 className="font-heading font-semibold text-lg">{title}</h2>
      <Button type="button" variant="outline" size="icon" onClick={onNext} aria-label={t.calendar.nextMonth}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

type MonthCalendarGridProps = {
  cells: CalendarCell[];
  weekdays: readonly string[];
  monthNames: readonly string[];
  dayDataAttribute: string;
  focusDay?: number | null;
  isFocusedDay?: (day: number) => boolean;
  hasFocusedItem?: (day: number) => boolean;
  renderDayOverlay?: (day: number) => ReactNode;
  overlayCoversContent?: (day: number) => boolean;
  renderDayContent: (ctx: { cell: CalendarCell; day: number }) => ReactNode;
};

function DayCellContent({
  cell,
  day,
  focused,
  hasFocus,
  dayDataAttribute,
  renderDayOverlay,
  overlayCoversContent,
  renderDayContent,
  mobile = false,
  skipOverlay = false,
}: {
  cell: CalendarCell;
  day: number;
  focused: boolean;
  hasFocus: boolean;
  dayDataAttribute: string;
  renderDayOverlay?: (day: number) => ReactNode;
  overlayCoversContent?: (day: number) => boolean;
  renderDayContent: (ctx: { cell: CalendarCell; day: number }) => ReactNode;
  mobile?: boolean;
  skipOverlay?: boolean;
}) {
  const coversContent = overlayCoversContent?.(day) ?? false;
  const overlay = skipOverlay ? null : renderDayOverlay?.(day);

  return (
    <div
      {...{ [`data-${dayDataAttribute}`]: day }}
      className={cn(
        "relative bg-background transition-all duration-200",
        mobile
          ? "min-h-[5.5rem] rounded-none border-2 border-border p-4 shadow-sm"
          : "min-h-24 p-2 md:min-h-28",
        cell.isToday && !focused && "shadow-[inset_0_0_0_1px] shadow-primary/30",
        focused && "bg-primary/4 shadow-[inset_0_0_0_2px] shadow-primary/50",
        mobile && cell.isToday && !focused && "border-primary/50 bg-primary/5",
        mobile && focused && "border-primary bg-primary/10"
      )}
    >
      {!coversContent ? overlay : null}
      <div
        className={cn(
          "relative z-10 pointer-events-none",
          mobile ? "flex h-full flex-col" : undefined
        )}
      >
        {!mobile ? (
          <span
            className={cn(
              "inline-flex size-6 items-center justify-center text-xs font-medium transition-colors",
              focused || hasFocus
                ? "rounded-full bg-primary text-primary-foreground font-semibold"
                : cell.isToday
                  ? "text-primary"
                  : "text-muted-foreground"
            )}
          >
            {day}
          </span>
        ) : null}
        <div className={cn("space-y-1", coversContent && "pointer-events-none [&_*]:pointer-events-none", mobile && "space-y-2")}>
          {renderDayContent({ cell, day })}
        </div>
      </div>
      {coversContent ? overlay : null}
    </div>
  );
}

type MobileWeekCalendarProps = {
  weeks: CalendarCell[][];
  focusDay: number | null;
  monthNames: readonly string[];
  weekdaysFull: readonly string[];
  dayDataAttribute: string;
  isFocusedDay?: (day: number) => boolean;
  hasFocusedItem?: (day: number) => boolean;
  renderDayOverlay?: (day: number) => ReactNode;
  overlayCoversContent?: (day: number) => boolean;
  renderDayContent: (ctx: { cell: CalendarCell; day: number }) => ReactNode;
};

function MobileWeekCalendar({
  weeks,
  focusDay,
  monthNames,
  weekdaysFull,
  dayDataAttribute,
  isFocusedDay,
  hasFocusedItem,
  renderDayOverlay,
  overlayCoversContent,
  renderDayContent,
}: MobileWeekCalendarProps) {
  const t = useT();
  const [weekIndex, setWeekIndex] = useState<number>(() =>
    findDefaultWeekIndex(weeks, { focusDay })
  );

  const activeWeek = weeks[weekIndex] ?? weeks[0] ?? [];
  const weekRangeLabel = formatWeekDayRangeLabel(activeWeek, monthNames);

  return (
    <div className="space-y-3 md:hidden">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={weekIndex <= 0}
          onClick={() => setWeekIndex((index) => Math.max(0, index - 1))}
          aria-label={t.common.calendarWeekPrevious}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-center text-sm font-semibold">{weekRangeLabel}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={weekIndex >= weeks.length - 1}
          onClick={() => setWeekIndex((index) => Math.min(weeks.length - 1, index + 1))}
          aria-label={t.common.calendarWeekNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {activeWeek.map((cell, dayIndex) => {
          if (!cell.isCurrentMonth || cell.day === null) {
            return (
              <div
                key={`mobile-pad-${weekIndex}-${dayIndex}`}
                className="min-h-10 rounded-none border border-dashed border-border/40 bg-muted/15"
                aria-hidden
              />
            );
          }

          const day = cell.day;
          const focused = isFocusedDay?.(day) ?? false;
          const hasFocus = hasFocusedItem?.(day) ?? false;
          const dayLabel = formatCalendarDayLabel(day, cell.month, monthNames);
          const overlay = renderDayOverlay?.(day);

          return (
            <div key={`mobile-${day}`} className="relative space-y-2">
              {overlay ? (
                <div className="absolute inset-0 z-20" aria-hidden={false}>
                  {overlay}
                </div>
              ) : null}
              <div
                className={cn(
                  overlay && "pointer-events-none [&_*]:pointer-events-none"
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {weekdaysFull[dayIndex]}
                  </p>
                  <p
                    className={cn(
                      "text-base font-bold tabular-nums",
                      focused || hasFocus
                        ? "text-primary"
                        : cell.isToday
                          ? "text-primary"
                          : "text-foreground"
                    )}
                  >
                    {dayLabel}
                  </p>
                </div>
                <DayCellContent
                  cell={cell}
                  day={day}
                  focused={focused}
                  hasFocus={hasFocus}
                  dayDataAttribute={dayDataAttribute}
                  renderDayOverlay={renderDayOverlay}
                  overlayCoversContent={overlayCoversContent}
                  renderDayContent={renderDayContent}
                  skipOverlay
                  mobile
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonthCalendarGrid({
  cells,
  weekdays,
  monthNames,
  dayDataAttribute,
  focusDay = null,
  isFocusedDay,
  hasFocusedItem,
  renderDayOverlay,
  overlayCoversContent,
  renderDayContent,
}: MonthCalendarGridProps) {
  const t = useT();
  const weekdaysFull = t.common.calendarWeekdaysFull;
  const weeks = useMemo(() => chunkCalendarWeeks(cells), [cells]);
  const mobileWeekKey = useMemo(() => {
    const anchor = cells.find((cell) => cell.isCurrentMonth && cell.day !== null);
    return `${anchor?.year ?? 0}-${anchor?.month ?? 0}-${focusDay ?? "none"}`;
  }, [cells, focusDay]);

  return (
    <>
      <MobileWeekCalendar
        key={mobileWeekKey}
        weeks={weeks}
        focusDay={focusDay}
        monthNames={monthNames}
        weekdaysFull={weekdaysFull}
        dayDataAttribute={dayDataAttribute}
        isFocusedDay={isFocusedDay}
        hasFocusedItem={hasFocusedItem}
        renderDayOverlay={renderDayOverlay}
        overlayCoversContent={overlayCoversContent}
        renderDayContent={renderDayContent}
      />

      {/* Desktop: classic month grid */}
      <div className="hidden md:grid md:grid-cols-7 md:gap-px md:border md:border-border md:bg-border">
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

          const day = cell.day;
          const focused = isFocusedDay?.(day) ?? false;
          const hasFocus = hasFocusedItem?.(day) ?? false;

          return (
            <DayCellContent
              key={`${cell.month}-${day}`}
              cell={cell}
              day={day}
              focused={focused}
              hasFocus={hasFocus}
              dayDataAttribute={dayDataAttribute}
              renderDayOverlay={renderDayOverlay}
              overlayCoversContent={overlayCoversContent}
              renderDayContent={renderDayContent}
            />
          );
        })}
      </div>
    </>
  );
}
