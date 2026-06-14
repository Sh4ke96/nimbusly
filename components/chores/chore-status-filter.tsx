"use client";

import { Button } from "@/components/ui/button";
import {
  CHORE_FILTER_ALL,
  CHORE_STATUSES,
} from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import { countChoresByStatus } from "@/lib/chores/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface ChoreStatusFilterProps {
  tasks: ChoreTask[];
  value: string;
  onChange: (key: string) => void;
}

export function ChoreStatusFilter({ tasks, value, onChange }: ChoreStatusFilterProps) {
  const t = useT();
  const counts = countChoresByStatus(tasks);

  const options: { key: string; label: string }[] = [
    { key: CHORE_FILTER_ALL, label: t.chores.filterAll },
    ...CHORE_STATUSES.map((status) => ({
      key: status,
      label: t.chores.statusLabels[status],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count = counts[option.key as keyof typeof counts] ?? 0;
        if (option.key !== CHORE_FILTER_ALL && count === 0) return null;

        return (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={value === option.key ? "default" : "outline"}
            className={cn("cursor-pointer rounded-none")}
            onClick={() => onChange(option.key)}
          >
            {option.label}
            <span className="ml-1 opacity-70">({count})</span>
          </Button>
        );
      })}
    </div>
  );
}
