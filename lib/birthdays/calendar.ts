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

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
