"use client";

import { MemberAvatar } from "@/components/member-avatar";
import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  CHORE_FILTER_ALL,
  CHORE_STATUSES,
} from "@/lib/constants/chores";
import {
  buildChoreAssigneeFilterOptions,
  countChoreTasksForAssignee,
} from "@/lib/chores/assignee-filter";
import type { ChoreTask } from "@/lib/chores/types";
import { countChoresByStatus } from "@/lib/chores/filters";
import { countActiveFilters } from "@/lib/filters/active-count";
import type { FamilyMember } from "@/lib/profile";
import { useLang, useT } from "@/lib/lang-context";

interface ChoresFiltersProps {
  tasks: ChoreTask[];
  members: FamilyMember[];
  isFamily: boolean;
  statusFilter: string;
  assigneeFilter: string;
  onStatusChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
}

export function ChoresFilters({
  tasks,
  members,
  isFamily,
  statusFilter,
  assigneeFilter,
  onStatusChange,
  onAssigneeChange,
}: ChoresFiltersProps) {
  const t = useT();
  const { lang } = useLang();
  const statusCounts = countChoresByStatus(tasks);
  const assigneeOptions = buildChoreAssigneeFilterOptions(
    tasks,
    members,
    t.chores.filterAll,
    t.chores.assigneeUnassigned,
    lang
  );

  const activeCount = countActiveFilters(
    isFamily ? [statusFilter, assigneeFilter] : [statusFilter],
    CHORE_FILTER_ALL
  );

  function clearAll() {
    onStatusChange(CHORE_FILTER_ALL);
    onAssigneeChange(CHORE_FILTER_ALL);
  }

  const statusOptions = [
    { value: CHORE_FILTER_ALL, label: t.chores.filterAll, count: statusCounts.all },
    ...CHORE_STATUSES.map((status) => ({
      value: status,
      label: t.chores.statusLabels[status],
      count: statusCounts[status],
    })),
  ];

  const assigneeToggleOptions = assigneeOptions.map((option) => {
    const member = option.memberId
      ? members.find((entry) => entry.id === option.memberId)
      : null;

    return {
      value: option.value,
      label: option.label,
      count: countChoreTasksForAssignee(tasks, option.value),
      leading: member ? (
        <MemberAvatar name={option.label} color={member.avatar_color} size="xs" />
      ) : undefined,
    };
  });

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={clearAll}
    >
      <div className="space-y-6">
        <FilterSheetSection label={t.chores.statusLabel}>
          <FilterToggleGroup
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            allValue={CHORE_FILTER_ALL}
          />
        </FilterSheetSection>

        {isFamily && assigneeToggleOptions.length > 1 ? (
          <FilterSheetSection label={t.chores.assigneeLabel}>
            <FilterToggleGroup
              value={assigneeFilter}
              onChange={onAssigneeChange}
              options={assigneeToggleOptions}
              allValue={CHORE_FILTER_ALL}
            />
          </FilterSheetSection>
        ) : null}
      </div>
    </FilterSheet>
  );
}
