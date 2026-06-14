import { CHORE_FILTER_ALL, CHORE_STATUS } from "@/lib/constants/chores";
import type { ChoreStatus } from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";

export function filterChoresByStatus(items: ChoreTask[], filterKey: string): ChoreTask[] {
  if (filterKey === CHORE_FILTER_ALL) return items;
  return items.filter((item) => item.status === filterKey);
}

export function filterChoresByAssignee(
  items: ChoreTask[],
  assigneeKey: string
): ChoreTask[] {
  if (assigneeKey === CHORE_FILTER_ALL) return items;
  if (assigneeKey === "unassigned") {
    return items.filter((item) => !item.assigned_to);
  }
  return items.filter((item) => item.assigned_to === assigneeKey);
}

export function countChoresByStatus(
  items: ChoreTask[]
): Record<ChoreStatus | "all", number> {
  const counts = {
    all: items.length,
    pending: 0,
    in_progress: 0,
    completed: 0,
  } as Record<ChoreStatus | "all", number>;

  for (const item of items) {
    counts[item.status] += 1;
  }

  return counts;
}

export function countActiveChores(items: ChoreTask[]): number {
  return items.filter(
    (item) =>
      item.status === CHORE_STATUS.PENDING || item.status === CHORE_STATUS.IN_PROGRESS
  ).length;
}

export function sortChoresForDisplay(items: ChoreTask[]): ChoreTask[] {
  const statusOrder: Record<ChoreStatus, number> = {
    [CHORE_STATUS.PENDING]: 0,
    [CHORE_STATUS.IN_PROGRESS]: 1,
    [CHORE_STATUS.COMPLETED]: 2,
  };

  return [...items].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function isChoreOverdue(task: ChoreTask, today = new Date()): boolean {
  if (!task.due_date || task.status === CHORE_STATUS.COMPLETED) return false;
  const due = parseIsoDate(task.due_date);
  if (!due) return false;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due.getTime() < start.getTime();
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
