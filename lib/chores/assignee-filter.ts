import {
  CHORE_ASSIGNEE_UNASSIGNED,
  CHORE_FILTER_ALL,
} from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import { compareByLocale } from "@/lib/i18n/compare";
import type { Lang } from "@/lib/constants/lang";
import { getDisplayName, type FamilyMember } from "@/lib/profile";

export interface ChoreAssigneeFilterOption {
  value: string;
  label: string;
  memberId?: string;
}

export function buildChoreAssigneeFilterOptions(
  tasks: ChoreTask[],
  members: FamilyMember[],
  allLabel: string,
  unassignedLabel: string,
  lang: Lang
): ChoreAssigneeFilterOption[] {
  const options: ChoreAssigneeFilterOption[] = [
    { value: CHORE_FILTER_ALL, label: allLabel },
  ];
  const seen = new Set<string>();

  for (const task of tasks) {
    const key = task.assigned_to ?? CHORE_ASSIGNEE_UNASSIGNED;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!task.assigned_to) {
      options.push({ value: CHORE_ASSIGNEE_UNASSIGNED, label: unassignedLabel });
      continue;
    }

    const member = members.find((entry) => entry.id === task.assigned_to);
    options.push({
      value: task.assigned_to,
      label: member ? getDisplayName(member) : unassignedLabel,
      memberId: task.assigned_to,
    });
  }

  return options.sort((a, b) => {
    if (a.value === CHORE_FILTER_ALL) return -1;
    if (b.value === CHORE_FILTER_ALL) return 1;
    if (a.value === CHORE_ASSIGNEE_UNASSIGNED) return -1;
    if (b.value === CHORE_ASSIGNEE_UNASSIGNED) return 1;
    return compareByLocale(a.label, b.label, lang);
  });
}

export function countChoreTasksForAssignee(tasks: ChoreTask[], key: string): number {
  if (key === CHORE_FILTER_ALL) return tasks.length;
  if (key === CHORE_ASSIGNEE_UNASSIGNED) {
    return tasks.filter((task) => !task.assigned_to).length;
  }
  return tasks.filter((task) => task.assigned_to === key).length;
}
