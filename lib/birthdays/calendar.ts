export function getMonthName(month: number, monthNames: readonly string[]): string {
  return monthNames[month - 1] ?? "";
}

export function getWeekdayLabels(weekdayLabels: readonly string[]): readonly string[] {
  return weekdayLabels;
}

export interface CalendarCell {
  date: Date | null;
  day: number | null;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const today = new Date();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({
      date: null,
      day: null,
      month,
      year,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    cells.push({
      date,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === month - 1 &&
        today.getDate() === day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: null,
      day: null,
      month,
      year,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return cells;
}

export function chunkCalendarWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function findDefaultWeekIndex(
  weeks: CalendarCell[][],
  options?: { focusDay?: number | null }
): number {
  const focusDay = options?.focusDay;
  if (focusDay != null) {
    const focusedWeek = weeks.findIndex((week) =>
      week.some((cell) => cell.isCurrentMonth && cell.day === focusDay)
    );
    if (focusedWeek >= 0) return focusedWeek;
  }

  const todayWeek = weeks.findIndex((week) => week.some((cell) => cell.isToday));
  if (todayWeek >= 0) return todayWeek;

  return 0;
}

export function formatWeekDayRangeLabel(
  week: CalendarCell[],
  monthNames: readonly string[]
): string {
  const inMonth = week.filter((cell) => cell.isCurrentMonth && cell.day !== null);
  if (inMonth.length === 0) return "";

  const monthName = getMonthName(inMonth[0]!.month, monthNames);
  const first = inMonth[0]!.day!;
  const last = inMonth[inMonth.length - 1]!.day!;

  if (first === last) return `${first} ${monthName}`;
  return `${first} - ${last} ${monthName}`;
}

export function formatCalendarDayLabel(
  day: number,
  month: number,
  monthNames: readonly string[]
): string {
  return `${day} ${getMonthName(month, monthNames)}`;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
