import type { BirthdayEntry } from "@/lib/birthdays/types";
import { scheduleDateKey, scheduleEntryIncludesDate } from "@/lib/schedule/types";
import type { ScheduleEntry } from "@/lib/schedule/types";
import { getChoreOccurrencesInMonth } from "@/lib/chores/calendar";
import type { ChoreTask } from "@/lib/chores/types";
import { APP_MODULE, APP_MODULE_ROUTES } from "@/lib/constants/app-modules";

export const FAMILY_CALENDAR_EVENT_KIND = {
  BIRTHDAY: "birthday",
  SCHEDULE: "schedule",
  CHORE: "chore",
} as const;

export type FamilyCalendarEventKind =
  (typeof FAMILY_CALENDAR_EVENT_KIND)[keyof typeof FAMILY_CALENDAR_EVENT_KIND];

export interface FamilyCalendarEvent {
  kind: FamilyCalendarEventKind;
  id: string;
  dateKey: string;
  label: string;
  href: string;
  detail?: string;
}

export function groupFamilyCalendarEventsByDay(
  events: FamilyCalendarEvent[]
): Map<number, FamilyCalendarEvent[]> {
  const map = new Map<number, FamilyCalendarEvent[]>();
  for (const event of events) {
    const day = Number(event.dateKey.split("-")[2]);
    const list = map.get(day) ?? [];
    list.push(event);
    map.set(day, list);
  }
  return map;
}

export function buildFamilyCalendarEvents(params: {
  year: number;
  month: number;
  birthdays: BirthdayEntry[];
  scheduleEntries: ScheduleEntry[];
  choreTasks: ChoreTask[];
}): FamilyCalendarEvent[] {
  const events: FamilyCalendarEvent[] = [];
  const { year, month } = params;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (const birthday of params.birthdays) {
    if (birthday.birth_month !== month) continue;
    const dateKey = scheduleDateKey(year, month, birthday.birth_day);
    events.push({
      kind: FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY,
      id: `birthday:${birthday.id}`,
      dateKey,
      label: birthday.person_name,
      href: APP_MODULE_ROUTES[APP_MODULE.BIRTHDAYS],
      detail: birthday.description || undefined,
    });
  }

  for (const entry of params.scheduleEntries) {
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = scheduleDateKey(year, month, day);
      if (!scheduleEntryIncludesDate(entry, dateKey)) continue;
      events.push({
        kind: FAMILY_CALENDAR_EVENT_KIND.SCHEDULE,
        id: `schedule:${entry.id}:${dateKey}`,
        dateKey,
        label: entry.description,
        href: APP_MODULE_ROUTES[APP_MODULE.CALENDAR],
      });
    }
  }

  const choreOccurrences = getChoreOccurrencesInMonth(params.choreTasks, year, month);
  for (const occurrence of choreOccurrences) {
    events.push({
      kind: FAMILY_CALENDAR_EVENT_KIND.CHORE,
      id: `chore:${occurrence.taskId}:${occurrence.date}`,
      dateKey: occurrence.date,
      label: occurrence.title,
      href: APP_MODULE_ROUTES[APP_MODULE.CHORES],
    });
  }

  return events;
}
