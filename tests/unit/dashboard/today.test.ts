import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_RECURRENCE, CHORE_STATUS } from "@/lib/constants/chores";
import { SCHEDULE_ENTRY_TYPE } from "@/lib/constants/schedule";
import { buildTodayItems, TODAY_KIND } from "@/lib/dashboard/today";
import type { ChoreTask } from "@/lib/chores/types";
import type { ScheduleEntry } from "@/lib/schedule/types";

const labels = {
  choreDue: (title: string) => `chore:${title}`,
  scheduleToday: (description: string) => `schedule:${description}`,
  birthdayToday: (name: string) => `birthday:${name}`,
};

describe("buildTodayItems", () => {
  it("collects chores due today, schedule entries, and birthdays", () => {
    const now = new Date(2026, 6, 12, 12, 0, 0);

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
      {
        id: "c2",
        family_id: "f1",
        title: "Zmywarka",
        notes: "",
        icon_emoji: null,
        completed_dates: [],
        status: CHORE_STATUS.COMPLETED,
        assigned_to: null,
        due_date: "2026-07-12",
        recurrence: CHORE_RECURRENCE.NONE,
        recurrence_interval_days: null,
        recurrence_end_date: null,
        recurrence_duration: null,
        recurrence_start_date: null,
        completed_at: "2026-07-12",
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

    const birthdays = [
      {
        id: "b1",
        person_name: "Anna",
        birth_day: 12,
        birth_month: 7,
        birth_year: 1990,
        description: "",
        family_id: "f1",
        created_by: "u1",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];

    const items = buildTodayItems({
      choreTasks,
      scheduleEntries,
      birthdays,
      labels,
      now,
    });

    assert.equal(items.length, 3);
    assert.equal(items[0].kind, TODAY_KIND.CHORE_DUE);
    assert.equal(items[1].kind, TODAY_KIND.SCHEDULE);
    assert.equal(items[2].kind, TODAY_KIND.BIRTHDAY);
    assert.equal(items[0].label, "chore:Śmieci");
    assert.equal(items[2].label, "birthday:Anna");
  });
});
