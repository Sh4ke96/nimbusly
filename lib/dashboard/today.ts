import type { BirthdayEntry } from "@/lib/birthdays/types";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { APP_MODULE, APP_MODULE_ROUTES } from "@/lib/constants/app-modules";
import type { ChoreTask } from "@/lib/chores/types";
import { parseChoreDateString } from "@/lib/chores/types";
import { scheduleDateKey, scheduleEntryIncludesDate } from "@/lib/schedule/types";
import type { ScheduleEntry } from "@/lib/schedule/types";
import type { LucideIcon } from "lucide-react";
import { getAppModuleIcon } from "@/lib/constants/app-modules";

export const TODAY_KIND = {
  CHORE_DUE: "chore_due",
  SCHEDULE: "schedule",
  BIRTHDAY: "birthday",
} as const;

export type TodayKind = (typeof TODAY_KIND)[keyof typeof TODAY_KIND];

export interface TodayItem {
  kind: TodayKind;
  href: string;
  label: string;
  detail?: string;
  pinKey: string;
}

export const TODAY_KIND_ICON: Record<TodayKind, LucideIcon> = {
  [TODAY_KIND.CHORE_DUE]: getAppModuleIcon(APP_MODULE.CHORES),
  [TODAY_KIND.SCHEDULE]: getAppModuleIcon(APP_MODULE.CALENDAR),
  [TODAY_KIND.BIRTHDAY]: getAppModuleIcon(APP_MODULE.BIRTHDAYS),
};

function todayParts(now = new Date()): { year: number; month: number; day: number; dateKey: string } {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return { year, month, day, dateKey: scheduleDateKey(year, month, day) };
}

export function buildTodayItems(params: {
  choreTasks: ChoreTask[];
  scheduleEntries: ScheduleEntry[];
  birthdays: BirthdayEntry[];
  labels: {
    choreDue: (title: string) => string;
    scheduleToday: (description: string) => string;
    birthdayToday: (name: string) => string;
  };
  limit?: number;
  now?: Date;
}): TodayItem[] {
  const { month, day, dateKey } = todayParts(params.now);
  const items: TodayItem[] = [];
  const limit = params.limit ?? 12;

  for (const task of params.choreTasks) {
    if (!task.due_date) continue;
    if (task.due_date !== dateKey) continue;
    if (task.status === CHORE_STATUS.COMPLETED) continue;
    items.push({
      kind: TODAY_KIND.CHORE_DUE,
      href: APP_MODULE_ROUTES[APP_MODULE.CHORES],
      label: params.labels.choreDue(task.title),
      pinKey: `today:chore:${task.id}`,
    });
  }

  for (const entry of params.scheduleEntries) {
    if (!scheduleEntryIncludesDate(entry, dateKey)) continue;
    items.push({
      kind: TODAY_KIND.SCHEDULE,
      href: APP_MODULE_ROUTES[APP_MODULE.CALENDAR],
      label: params.labels.scheduleToday(entry.description),
      pinKey: `today:schedule:${entry.id}`,
    });
  }

  for (const birthday of params.birthdays) {
    if (birthday.birth_month !== month || birthday.birth_day !== day) continue;
    items.push({
      kind: TODAY_KIND.BIRTHDAY,
      href: APP_MODULE_ROUTES[APP_MODULE.BIRTHDAYS],
      label: params.labels.birthdayToday(birthday.person_name),
      pinKey: `today:birthday:${birthday.id}`,
    });
  }

  return items.slice(0, limit);
}

export function isChoreDueToday(task: ChoreTask, now = new Date()): boolean {
  if (!task.due_date) return false;
  const parsed = parseChoreDateString(task.due_date);
  if (!parsed) return false;
  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate()
  );
}
