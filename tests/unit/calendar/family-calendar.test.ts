import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_RECURRENCE, CHORE_STATUS } from "@/lib/constants/chores";
import { SCHEDULE_ENTRY_TYPE } from "@/lib/constants/schedule";
import {
  buildFamilyCalendarEvents,
  FAMILY_CALENDAR_EVENT_KIND,
  groupFamilyCalendarEventsByDay,
} from "@/lib/calendar/family-calendar";
import type { ChoreTask } from "@/lib/chores/types";
import type { ScheduleEntry } from "@/lib/schedule/types";

describe("buildFamilyCalendarEvents", () => {
  it("merges birthdays, schedule ranges, and chore due dates", () => {
    const birthdays = [
      {
        id: "b1",
        person_name: "Anna",
        birth_day: 12,
        birth_month: 7,
        birth_year: null,
        description: "",
        family_id: "f1",
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];

    const scheduleEntries: ScheduleEntry[] = [
      {
        id: "s1",
        family_id: "f1",
        description: "Dyżur",
        entry_type: SCHEDULE_ENTRY_TYPE.WORK,
        entry_date: "2026-07-10",
        entry_end_date: "2026-07-12",
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];

    const choreTasks: ChoreTask[] = [
      {
        id: "c1",
        family_id: "f1",
        title: "Śmieci",
        notes: "",
        icon_emoji: null,
        completed_dates: [],
        status: CHORE_STATUS.PENDING,
        assigned_to: null,
        due_date: "2026-07-12",
        recurrence: CHORE_RECURRENCE.NONE,
        recurrence_interval_days: null,
        recurrence_end_date: null,
        recurrence_duration: null,
        recurrence_start_date: null,
        completed_at: null,
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];

    const events = buildFamilyCalendarEvents({
      year: 2026,
      month: 7,
      birthdays,
      scheduleEntries,
      choreTasks,
    });

    assert.ok(events.some((e) => e.kind === FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY && e.label === "Anna"));
    assert.ok(
      events.some(
        (e) =>
          e.kind === FAMILY_CALENDAR_EVENT_KIND.SCHEDULE &&
          e.dateKey === "2026-07-11" &&
          e.label === "Dyżur"
      )
    );
    assert.ok(
      events.some(
        (e) =>
          e.kind === FAMILY_CALENDAR_EVENT_KIND.CHORE &&
          e.dateKey === "2026-07-12" &&
          e.label === "Śmieci"
      )
    );
  });
});

describe("groupFamilyCalendarEventsByDay", () => {
  it("groups events by day of month", () => {
    const grouped = groupFamilyCalendarEventsByDay([
      {
        kind: FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY,
        id: "1",
        dateKey: "2026-07-12",
        label: "Anna",
        href: "/birthdays",
      },
      {
        kind: FAMILY_CALENDAR_EVENT_KIND.CHORE,
        id: "2",
        dateKey: "2026-07-12",
        label: "Śmieci",
        href: "/chores",
      },
    ]);

    assert.equal(grouped.get(12)?.length, 2);
  });
});
