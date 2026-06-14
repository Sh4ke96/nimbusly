"use client";

import { Button } from "@/components/ui/button";
import { BUDGET_ENTRY_TYPE, BUDGET_FILTER_ALL } from "@/lib/constants/budget";
import type { BudgetExpense } from "@/lib/budget/types";
import { filterByEntryType } from "@/lib/budget/aggregates";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BudgetTypeFilterProps {
  entries: BudgetExpense[];
  value: string;
  onChange: (key: string) => void;
}

export function BudgetTypeFilter({ entries, value, onChange }: BudgetTypeFilterProps) {
  const t = useT();

  const options = [
    { key: BUDGET_FILTER_ALL, label: t.budget.filterAllTypes },
    { key: BUDGET_ENTRY_TYPE.INCOME, label: t.budget.filterIncome },
    { key: BUDGET_ENTRY_TYPE.EXPENSE, label: t.budget.filterExpenses },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count = filterByEntryType(entries, option.key).length;
        if (option.key !== BUDGET_FILTER_ALL && count === 0) return null;

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
            <span className="text-[10px] opacity-70">({count})</span>
          </Button>
        );
      })}
    </div>
  );
}
