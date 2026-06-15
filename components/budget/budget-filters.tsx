"use client";

import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  BUDGET_ENTRY_TYPE,
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_FILTER_ALL,
  BUDGET_INCOME_CATEGORIES,
  type BudgetCategory,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import { aggregateByCategory, filterByEntryType } from "@/lib/budget/aggregates";
import type { BudgetExpense } from "@/lib/budget/types";
import { isExpenseEntry, isIncomeEntry } from "@/lib/budget/types";
import { countActiveFilters } from "@/lib/filters/active-count";
import { useT } from "@/lib/lang-context";

interface BudgetFiltersProps {
  entries: BudgetExpense[];
  typeFilter: string;
  categoryFilter: string;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function BudgetFilters({
  entries,
  typeFilter,
  categoryFilter,
  onTypeChange,
  onCategoryChange,
}: BudgetFiltersProps) {
  const t = useT();
  const activeCount = countActiveFilters([typeFilter, categoryFilter], BUDGET_FILTER_ALL);

  function clearAll() {
    onTypeChange(BUDGET_FILTER_ALL);
    onCategoryChange(BUDGET_FILTER_ALL);
  }

  const typeOptions = [
    { value: BUDGET_FILTER_ALL, label: t.budget.filterAllTypes },
    { value: BUDGET_ENTRY_TYPE.INCOME, label: t.budget.filterIncome },
    { value: BUDGET_ENTRY_TYPE.EXPENSE, label: t.budget.filterExpenses },
  ].map((option) => ({
    ...option,
    count: filterByEntryType(entries, option.value).length,
  }));

  const scopedEntries =
    typeFilter === BUDGET_ENTRY_TYPE.INCOME
      ? entries.filter(isIncomeEntry)
      : typeFilter === BUDGET_ENTRY_TYPE.EXPENSE
        ? entries.filter(isExpenseEntry)
        : [];

  const categories: readonly BudgetCategory[] =
    typeFilter === BUDGET_ENTRY_TYPE.INCOME
      ? BUDGET_INCOME_CATEGORIES
      : typeFilter === BUDGET_ENTRY_TYPE.EXPENSE
        ? BUDGET_EXPENSE_CATEGORIES
        : [];

  const totals =
    categories.length > 0 ? aggregateByCategory(scopedEntries, categories) : [];

  const categoryOptions =
    typeFilter === BUDGET_FILTER_ALL
      ? []
      : [
          { value: BUDGET_FILTER_ALL, label: t.budget.filterAll, count: scopedEntries.length },
          ...categories.map((category) => ({
            value: category,
            label:
              typeFilter === BUDGET_ENTRY_TYPE.INCOME
                ? t.budget.incomeCategoryLabels[category as BudgetIncomeCategory]
                : t.budget.categoryLabels[category as BudgetExpenseCategory],
            count: totals.find((row) => row.category === category)?.count ?? 0,
          })),
        ];

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={clearAll}
    >
      <div className="space-y-6">
        <FilterSheetSection label={t.budget.entryTypeLabel}>
          <FilterToggleGroup
            value={typeFilter}
            onChange={(value) => {
              onTypeChange(value);
              onCategoryChange(BUDGET_FILTER_ALL);
            }}
            options={typeOptions}
            allValue={BUDGET_FILTER_ALL}
          />
        </FilterSheetSection>

        {categoryOptions.length > 0 ? (
          <FilterSheetSection label={t.budget.categoryLabel}>
            <FilterToggleGroup
              value={categoryFilter}
              onChange={onCategoryChange}
              options={categoryOptions}
              allValue={BUDGET_FILTER_ALL}
            />
          </FilterSheetSection>
        ) : null}
      </div>
    </FilterSheet>
  );
}
