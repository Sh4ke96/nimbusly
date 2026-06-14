"use client";

import { Button } from "@/components/ui/button";
import {
  BUDGET_ENTRY_TYPE,
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_FILTER_ALL,
  BUDGET_INCOME_CATEGORIES,
  type BudgetCategory,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import type { BudgetExpense } from "@/lib/budget/types";
import { aggregateByCategory } from "@/lib/budget/aggregates";
import { isExpenseEntry, isIncomeEntry } from "@/lib/budget/types";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BudgetCategoryFilterProps {
  entries: BudgetExpense[];
  typeFilter: string;
  value: string;
  onChange: (key: string) => void;
}

export function BudgetCategoryFilter({
  entries,
  typeFilter,
  value,
  onChange,
}: BudgetCategoryFilterProps) {
  const t = useT();

  const scopedEntries =
    typeFilter === BUDGET_ENTRY_TYPE.INCOME
      ? entries.filter(isIncomeEntry)
      : typeFilter === BUDGET_ENTRY_TYPE.EXPENSE
        ? entries.filter(isExpenseEntry)
        : entries;

  const categories: readonly BudgetCategory[] =
    typeFilter === BUDGET_ENTRY_TYPE.INCOME
      ? BUDGET_INCOME_CATEGORIES
      : typeFilter === BUDGET_ENTRY_TYPE.EXPENSE
        ? BUDGET_EXPENSE_CATEGORIES
        : [];

  if (typeFilter === BUDGET_FILTER_ALL) {
    return null;
  }

  const totals = aggregateByCategory(scopedEntries, categories);

  const options: { key: string; label: string }[] = [
    { key: BUDGET_FILTER_ALL, label: t.budget.filterAll },
    ...categories.map((category) => ({
      key: category,
      label:
        typeFilter === BUDGET_ENTRY_TYPE.INCOME
          ? t.budget.incomeCategoryLabels[category as BudgetIncomeCategory]
          : t.budget.categoryLabels[category as BudgetExpenseCategory],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count =
          option.key === BUDGET_FILTER_ALL
            ? scopedEntries.length
            : totals.find((row) => row.category === option.key)?.count ?? 0;

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
