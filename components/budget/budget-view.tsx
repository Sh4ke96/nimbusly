"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { BudgetCard } from "@/components/budget/budget-card";
import { BudgetCategoryFilter } from "@/components/budget/budget-category-filter";
import { BudgetCharts } from "@/components/budget/budget-charts";
import { BudgetEditDialog } from "@/components/budget/budget-edit-dialog";
import { BudgetExpenseFormDialog } from "@/components/budget/budget-expense-form-dialog";
import { BudgetExpensesList } from "@/components/budget/budget-expenses-list";
import { BudgetFormDialog } from "@/components/budget/budget-form-dialog";
import { BudgetMonthPicker } from "@/components/budget/budget-month-picker";
import { BudgetTypeFilter } from "@/components/budget/budget-type-filter";
import { BudgetWatchButton } from "@/components/budget/budget-watch-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  aggregateExpensesByCategory,
  aggregateIncomeByCategory,
  filterByEntryType,
  filterEntriesByCategory,
  formatBudgetAmount,
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { filterEntriesByMonth, getCurrentMonthKey } from "@/lib/budget/monthly";
import { BudgetIncomeFormDialog } from "@/components/budget/budget-income-form-dialog";
import { buildBudgetPrintHtml, openBudgetPrintWindow } from "@/lib/budget/print-document";
import type { Budget } from "@/lib/budget/types";
import { BUDGET_ENTRY_TYPE, BUDGET_FILTER_ALL, type BudgetExpenseCategory, type BudgetIncomeCategory } from "@/lib/constants/budget";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";
import { useProfileStore } from "@/lib/stores/profile-store";
import {
  selectBudgetExpenses,
  selectBudgetMemberIds,
  EMPTY_BUDGET_EXPENSES,
  EMPTY_BUDGET_MEMBER_IDS,
  useBudgetStore,
} from "@/lib/stores/budget-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { cn } from "@/lib/utils";

export function BudgetView() {
  const t = useT();
  const { lang } = useLang();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);

  const budgets = useBudgetStore((s) => s.budgets);
  const loaded = useBudgetStore((s) => s.loaded);
  const loading = useBudgetStore((s) => s.loading);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);
  const fetchWatches = useBudgetStore((s) => s.fetchWatches);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey);
  const [typeFilter, setTypeFilter] = useState<string>(BUDGET_FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(BUDGET_FILTER_ALL);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const selectExpenses = useMemo(
    () =>
      activeBudgetId
        ? selectBudgetExpenses(activeBudgetId)
        : () => EMPTY_BUDGET_EXPENSES,
    [activeBudgetId]
  );
  const selectMemberIds = useMemo(
    () =>
      activeBudgetId
        ? selectBudgetMemberIds(activeBudgetId)
        : () => EMPTY_BUDGET_MEMBER_IDS,
    [activeBudgetId]
  );
  const allEntries = useBudgetStore(selectExpenses);
  const selectEditingMemberIds = useMemo(
    () =>
      editingBudget
        ? selectBudgetMemberIds(editingBudget.id)
        : () => EMPTY_BUDGET_MEMBER_IDS,
    [editingBudget]
  );
  const activeMemberIds = useBudgetStore(selectMemberIds);
  const editingMemberIds = useBudgetStore(selectEditingMemberIds);

  const monthlyEntries = useMemo(
    () => filterEntriesByMonth(allEntries, selectedMonthKey),
    [allEntries, selectedMonthKey]
  );

  const typeFilteredEntries = useMemo(
    () => filterByEntryType(monthlyEntries, typeFilter),
    [monthlyEntries, typeFilter]
  );

  const filteredEntries = useMemo(
    () => filterEntriesByCategory(typeFilteredEntries, categoryFilter),
    [typeFilteredEntries, categoryFilter]
  );

  const activeBudget = useMemo(
    () => budgets.find((budget) => budget.id === activeBudgetId) ?? null,
    [budgets, activeBudgetId]
  );

  const incomeTotal = sumIncomeOnly(monthlyEntries);
  const expenseTotal = sumExpensesOnly(monthlyEntries);
  const balance = netBalance(monthlyEntries);

  const expenseCategoryTotals = aggregateExpensesByCategory(monthlyEntries).filter(
    (row) => row.total > 0
  );
  const incomeCategoryTotals = aggregateIncomeByCategory(monthlyEntries).filter(
    (row) => row.total > 0
  );

  useEffect(() => {
    if (!loaded) void fetchBudgets();
    void fetchWatches();
  }, [loaded, fetchBudgets, fetchWatches]);

  useEffect(() => {
    if (budgets.length === 0) {
      setActiveBudgetId(null);
      return;
    }
    if (!activeBudgetId || !budgets.some((b) => b.id === activeBudgetId)) {
      setActiveBudgetId(budgets[0]?.id ?? null);
    }
  }, [budgets, activeBudgetId]);

  useEffect(() => {
    setTypeFilter(BUDGET_FILTER_ALL);
    setCategoryFilter(BUDGET_FILTER_ALL);
    setSelectedMonthKey(getCurrentMonthKey());
  }, [activeBudgetId]);

  useEffect(() => {
    setCategoryFilter(BUDGET_FILTER_ALL);
  }, [typeFilter]);

  const onDataChanged = () => {
    void fetchBudgets(true);
    void fetchNotifications(true);
  };

  const onWatchChanged = () => {
    void fetchWatches(true);
  };

  function openEdit(budget: Budget) {
    setEditingBudget(budget);
    setEditOpen(true);
  }

  function handlePrint() {
    if (!activeBudget) return;
    const memberNames = activeMemberIds
      .map((id) => members.find((m) => m.id === id))
      .filter(Boolean)
      .map((m) => getDisplayName(m!));

    const html = buildBudgetPrintHtml({
      budgetName: activeBudget.name,
      memberNames,
      entries: allEntries,
      lang,
      labels: {
        title: t.budget.printTitle,
        subtitle: t.budget.printSubtitle,
        generatedAt: t.budget.printGeneratedAt,
        incomeLabel: t.budget.incomeLabel,
        expensesLabel: t.budget.expensesLabel,
        balanceLabel: t.budget.balanceLabel,
        totalLabel: t.budget.totalLabel,
        categoryLabel: t.budget.categoryLabel,
        amountLabel: t.budget.amountLabel,
        dateLabel: t.budget.dateLabel,
        descriptionLabel: t.budget.descriptionLabel,
        typeLabel: t.budget.entryTypeLabel,
        memberLabel: t.budget.membersLabel,
        membersValue: memberNames.join(", "),
        noEntries: t.budget.emptyEntries,
        categoryLabels: t.budget.categoryLabels,
        incomeCategoryLabels: t.budget.incomeCategoryLabels,
        entryTypeLabels: {
          income: t.budget.filterIncome,
          expense: t.budget.filterExpenses,
        },
      },
    });
    openBudgetPrintWindow(html);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.budget.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.budget.title}</h1>
            <p className="text-sm text-muted-foreground">{t.budget.subtitle}</p>
          </div>
          <BudgetFormDialog onSuccess={onDataChanged} />
        </div>

        {loading && !loaded ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-72 w-full rounded-none" />
          </div>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {t.budget.empty}
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className="space-y-3 no-print">
              <h2 className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                {t.budget.budgetsHeading}
              </h2>
              <div className="space-y-3">
                {budgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    members={members}
                    selected={budget.id === activeBudgetId}
                    onSelect={() => setActiveBudgetId(budget.id)}
                    onEdit={() => openEdit(budget)}
                    onDeleted={onDataChanged}
                    onWatchChanged={onWatchChanged}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-4 no-print">
                <h2 className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                  {activeBudget?.name ?? t.budget.detailsHeading}
                </h2>

                <BudgetMonthPicker value={selectedMonthKey} onChange={setSelectedMonthKey} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="border border-primary/25 bg-primary/10 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <TrendingUp className="size-4 shrink-0" />
                      <p className="text-[11px] uppercase tracking-wider font-medium">
                        {t.budget.incomeLabel}
                      </p>
                    </div>
                    <p className="font-heading text-xl font-semibold mt-1 text-primary">
                      {formatBudgetAmount(incomeTotal, lang)}
                    </p>
                  </div>

                  <div className="border border-orange-200/80 bg-orange-50/80 dark:border-orange-900/50 dark:bg-orange-950/30 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <TrendingDown className="size-4 shrink-0" />
                      <p className="text-[11px] uppercase tracking-wider font-medium">
                        {t.budget.expensesLabel}
                      </p>
                    </div>
                    <p className="font-heading text-xl font-semibold mt-1 text-orange-800 dark:text-orange-300">
                      {formatBudgetAmount(expenseTotal, lang)}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "border px-4 py-3 shadow-sm",
                      balance >= 0
                        ? "border-border bg-card"
                        : "border-red-200/80 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        balance >= 0
                          ? "text-muted-foreground"
                          : "text-red-700 dark:text-red-400"
                      )}
                    >
                      <Scale className="size-4 shrink-0" />
                      <p className="text-[11px] uppercase tracking-wider font-medium">
                        {t.budget.balanceLabel}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "font-heading text-xl font-semibold mt-1",
                        balance >= 0
                          ? "text-foreground"
                          : "text-red-800 dark:text-red-300"
                      )}
                    >
                      {formatBudgetAmount(balance, lang)}
                    </p>
                  </div>
                </div>

                {activeBudgetId && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <BudgetExpenseFormDialog
                        budgetId={activeBudgetId}
                        onSuccess={onDataChanged}
                      />
                      <BudgetIncomeFormDialog
                        budgetId={activeBudgetId}
                        onSuccess={onDataChanged}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BudgetWatchButton budgetId={activeBudgetId} onChanged={onWatchChanged} />
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={handlePrint}
                      >
                        <Printer className="size-4" />
                        {t.budget.printBtn}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {(expenseCategoryTotals.length > 0 || incomeCategoryTotals.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 no-print">
                  {incomeCategoryTotals.map((row) => (
                    <div
                      key={`income-${row.category}`}
                      className="border border-border bg-card px-3 py-2 text-sm shadow-sm"
                    >
                      <p className="text-[11px] text-muted-foreground">
                        {t.budget.incomeCategoryLabels[row.category as BudgetIncomeCategory]}
                      </p>
                      <p className="font-heading font-semibold text-primary">
                        +{formatBudgetAmount(row.total, lang)}
                      </p>
                    </div>
                  ))}
                  {expenseCategoryTotals.map((row) => (
                    <div
                      key={`expense-${row.category}`}
                      className="border border-border bg-card px-3 py-2 text-sm shadow-sm"
                    >
                      <p className="text-[11px] text-muted-foreground">
                        {t.budget.categoryLabels[row.category as BudgetExpenseCategory]}
                      </p>
                      <p className="font-heading font-semibold text-orange-700 dark:text-orange-400">
                        −{formatBudgetAmount(row.total, lang)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="no-print space-y-3">
                <BudgetCharts
                  entries={monthlyEntries}
                  typeFilter={typeFilter}
                  heading={t.budget.monthlyChartsHeading}
                />
              </div>

              {activeBudgetId && (
                <>
                  <div className="space-y-2 no-print">
                    <BudgetTypeFilter
                      entries={monthlyEntries}
                      value={typeFilter}
                      onChange={setTypeFilter}
                    />
                    <BudgetCategoryFilter
                      entries={monthlyEntries}
                      typeFilter={typeFilter}
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                    />
                  </div>
                  <BudgetExpensesList
                    budgetId={activeBudgetId}
                    entries={filteredEntries}
                    profile={profile}
                    members={members}
                    userId={user?.id}
                    onChanged={onDataChanged}
                  />
                </>
              )}
            </section>
          </div>
        )}
      </main>

      <BudgetEditDialog
        budget={editingBudget}
        memberIds={editingMemberIds}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onDataChanged}
      />
    </div>
  );
}
