"use client";

import { resolveChoreAssigneeName } from "@/components/chores/chore-assignee-picker";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import {
  CHORE_ASSIGNEE_UNASSIGNED,
  CHORE_FILTER_ALL,
} from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import type { FamilyMember } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface AssigneeFilterOption {
  key: string;
  label: string;
  memberId?: string;
}

function buildAssigneeFilterOptions(
  tasks: ChoreTask[],
  members: FamilyMember[],
  allLabel: string,
  unassignedLabel: string
): AssigneeFilterOption[] {
  const options: AssigneeFilterOption[] = [{ key: CHORE_FILTER_ALL, label: allLabel }];
  const seen = new Set<string>();

  for (const task of tasks) {
    const key = task.assigned_to ?? CHORE_ASSIGNEE_UNASSIGNED;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!task.assigned_to) {
      options.push({ key: CHORE_ASSIGNEE_UNASSIGNED, label: unassignedLabel });
      continue;
    }

    options.push({
      key: task.assigned_to,
      label: resolveChoreAssigneeName(task.assigned_to, null, members, unassignedLabel),
      memberId: task.assigned_to,
    });
  }

  return options.sort((a, b) => {
    if (a.key === CHORE_FILTER_ALL) return -1;
    if (b.key === CHORE_FILTER_ALL) return 1;
    if (a.key === CHORE_ASSIGNEE_UNASSIGNED) return -1;
    if (b.key === CHORE_ASSIGNEE_UNASSIGNED) return 1;
    return a.label.localeCompare(b.label, "pl");
  });
}

function countTasksForAssigneeKey(tasks: ChoreTask[], key: string): number {
  if (key === CHORE_FILTER_ALL) return tasks.length;
  if (key === CHORE_ASSIGNEE_UNASSIGNED) {
    return tasks.filter((task) => !task.assigned_to).length;
  }
  return tasks.filter((task) => task.assigned_to === key).length;
}

interface ChoreAssigneeFilterProps {
  tasks: ChoreTask[];
  members: FamilyMember[];
  value: string;
  onChange: (key: string) => void;
}

export function ChoreAssigneeFilter({
  tasks,
  members,
  value,
  onChange,
}: ChoreAssigneeFilterProps) {
  const t = useT();
  const options = buildAssigneeFilterOptions(
    tasks,
    members,
    t.chores.filterAll,
    t.chores.assigneeUnassigned
  );

  if (options.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.key;
        const member = option.memberId
          ? members.find((m) => m.id === option.memberId)
          : null;
        const count = countTasksForAssigneeKey(tasks, option.key);

        return (
          <Button
            key={option.key}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            className={cn("rounded-none gap-2", !selected && "bg-background")}
            onClick={() => onChange(option.key)}
          >
            {member && (
              <MemberAvatar
                name={option.label}
                color={member.avatar_color}
                size="xs"
              />
            )}
            {option.label}
            {option.key !== CHORE_FILTER_ALL && (
              <span className="text-[10px] opacity-70">({count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
