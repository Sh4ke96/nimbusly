"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { useResolvedItemSelection } from "@/lib/hooks/use-resolved-item-selection";
import { ModuleSectionHeading } from "@/components/ui/module-section-heading";
import { Eye, EyeOff, BarChart3, Download, Printer, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { BudgetCard } from "@/components/budget/budget-card";
import { BudgetFilters } from "@/components/budget/budget-filters";
import { BudgetChartsLazy } from "@/components/budget/budget-charts-lazy";
import { BudgetEditDialog } from "@/components/budget/budget-edit-dialog";
import { BudgetExpenseFormDialog } from "@/components/budget/budget-expense-form-dialog";
import { BudgetExpensesList } from "@/components/budget/budget-expenses-list";
import { BudgetFormDialog } from "@/components/budget/budget-form-dialog";
import { BudgetMonthPicker } from "@/components/budget/budget-month-picker";
import { BudgetWatchButton } from "@/components/budget/budget-watch-button";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
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
import {
  buildBudgetEntriesCsv,
  downloadCsv,
  formatCsvDateStamp,
  sanitizeCsvFilename,
} from "@/lib/budget/export-csv";
import type { Budget } from "@/lib/budget/types";
import { BUDGET_FILTER_ALL, type BudgetExpenseCategory, type BudgetIncomeCategory } from "@/lib/constants/budget";
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
import { cn } from "@/lib/utils";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_DEEP_LINK_QUERY } from "@/lib/constants/notification-deep-links";

export function BudgetView() {
  const t = useT();
  const { lang } = useLang();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const budgets = useBudgetStore((s) => s.budgets);
  const loaded = useBudgetStore((s) => s.loaded);
  const loading = useBudgetStore((s) => s.loading);
  const error = useBudgetStore((s) => s.error);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);
  const fetchWatches = useBudgetStore((s) => s.fetchWatches);

  const [showHiddenBudgets, setShowHiddenBudgets] = useState<boolean>(false);

  const visibleBudgets = useMemo(
    () => budgets.filter((budget) => showHiddenBudgets || !budget.is_hidden),
    [budgets, showHiddenBudgets]
  );
  const hiddenBudgetCount = budgets.length - visibleBudgets.length;

  const budgetIdsKey = useMemo(
    () => visibleBudgets.map((budget) => budget.id).join("|"),
    [visibleBudgets]
  );
  const searchParams = useSearchParams();
  const budgetFromUrl = searchParams.get(NOTIFICATION_DEEP_LINK_QUERY.BUDGET);
  const [activeBudgetId, setSelectedBudgetId] = useResolvedItemSelection(budgetIdsKey);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(getCurrentMonthKey);
  const [typeFilter, setTypeFilter] = useState<string>(BUDGET_FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(BUDGET_FILTER_ALL);
  const [filtersBudgetId, setFiltersBudgetId] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

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
    () => visibleBudgets.find((budget) => budget.id === activeBudgetId) ?? null,
    [visibleBudgets, activeBudgetId]
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

  useStoreBootstrap(loaded, error, fetchBudgets);

  useEffect(() => {
    if (!budgetFromUrl || visibleBudgets.length === 0) return;
    if (visibleBudgets.some((budget) => budget.id === budgetFromUrl)) {
      setSelectedBudgetId(budgetFromUrl);
    }
  }, [budgetFromUrl, visibleBudgets, setSelectedBudgetId]);

  const onBudgetDataChanged = useCallback(() => {
    void fetchBudgets(true);
  }, [fetchBudgets]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "budget-expenses",
    table: "budget_expenses",
    onChange: onBudgetDataChanged,
  });

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "budgets",
    table: "budgets",
    onChange: onBudgetDataChanged,
  });

  useEffect(() => {
    void fetchWatches();
  }, [fetchWatches]);

  if (activeBudgetId !== filtersBudgetId) {
    setFiltersBudgetId(activeBudgetId);
    if (filtersBudgetId !== null) {
      setTypeFilter(BUDGET_FILTER_ALL);
      setCategoryFilter(BUDGET_FILTER_ALL);
      setSelectedMonthKey(getCurrentMonthKey());
    }
  }

  function selectBudget(id: string) {
    setSelectedBudgetId(id);
    setTypeFilter(BUDGET_FILTER_ALL);
    setCategoryFilter(BUDGET_FILTER_ALL);
    setSelectedMonthKey(getCurrentMonthKey());
  }

  function handleTypeFilterChange(value: string) {
    setTypeFilter(value);
    setCategoryFilter(BUDGET_FILTER_ALL);
  }

  const onDataChanged = useModuleRefresh(fetchBudgets);

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
        entriesHeading: t.budget.printEntriesHeading,
      },
    });
    openBudgetPrintWindow(html);
  }

  function handleExportCsv() {
    if (!activeBudget) return;
    const content = buildBudgetEntriesCsv({
      budgetName: activeBudget.name,
      expenses: monthlyEntries,
      lang,
      labels: {
        date: t.budget.dateLabel,
        type: t.budget.entryTypeLabel,
        category: t.budget.categoryLabel,
        amount: t.budget.amountLabel,
        description: t.budget.descriptionLabel,
        income: t.budget.filterIncome,
        expense: t.budget.filterExpenses,
      },
    });
    downloadCsv(
      `${sanitizeCsvFilename(activeBudget.name)}-${formatCsvDateStamp()}.csv`,
      content
    );
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="wide">
        <AccountBreadcrumbs current={t.budget.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="min-w-0 space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_HEADER}>
            <h1 className="font-heading font-bold text-xl tracking-tight sm:text-2xl">
              {t.budget.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.budget.subtitle}</p>
          </div>
          <div className="w-full sm:w-auto" data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_ADD}>
            <BudgetFormDialog onSuccess={onDataChanged} triggerClassName="w-full sm:w-auto" />
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchBudgets(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-72 w-full rounded-none" />
          </div>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {t.budget.empty}
          </p>
        ) : visibleBudgets.length === 0 ? (
          <div className="space-y-3 text-center py-16 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">{t.budget.emptyHidden}</p>
            {hiddenBudgetCount > 0 && (
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowHiddenBudgets(true)}
              >
                <Eye className="size-4" />
                {t.budget.showHiddenBtn}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className="min-w-0 space-y-3 no-print" data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_LISTS}>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <ModuleSectionHeading icon={Wallet}>
                  {t.budget.budgetsHeading}
                </ModuleSectionHeading>
                <NimbusTourToolbarAnchor
                  tourTarget={NIMBUS_TOUR_TARGET.BUDGET_HIDDEN}
                  visible={hiddenBudgetCount > 0 || showHiddenBudgets}
                >
                  {hiddenBudgetCount > 0 || showHiddenBudgets ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer shrink-0"
                      onClick={() => setShowHiddenBudgets((value) => !value)}
                    >
                      {showHiddenBudgets ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="hidden sm:inline">
                        {showHiddenBudgets ? t.budget.hideHiddenBtn : t.budget.showHiddenBtn}
                      </span>
                    </Button>
                  ) : null}
                </NimbusTourToolbarAnchor>
              </div>
              <div className="space-y-3">
                {visibleBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    members={members}
                    selected={budget.id === activeBudgetId}
                    onSelect={() => selectBudget(budget.id)}
                    onEdit={() => openEdit(budget)}
                    onDeleted={onDataChanged}
                    onWatchChanged={onWatchChanged}
                  />
                ))}
              </div>
            </section>

            <section className="min-w-0 space-y-4" data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_DETAIL}>
              <div className="space-y-4 no-print">
                <ModuleSectionHeading icon={BarChart3}>
                  {activeBudget?.name ?? t.budget.detailsHeading}
                </ModuleSectionHeading>

                <BudgetMonthPicker value={selectedMonthKey} onChange={setSelectedMonthKey} />

                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                  <div className="border border-primary/25 bg-primary/10 px-2 py-2.5 shadow-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-1 text-primary sm:gap-2">
                      <TrendingUp className="size-3.5 shrink-0 sm:size-4" />
                      <p className="text-[9px] uppercase tracking-wider font-medium leading-tight sm:text-[11px]">
                        {t.budget.incomeLabel}
                      </p>
                    </div>
                    <p className="mt-1 truncate font-heading text-sm font-semibold text-primary sm:text-xl">
                      {formatBudgetAmount(incomeTotal, lang)}
                    </p>
                  </div>

                  <div className="border border-orange-200/80 bg-orange-50/80 px-2 py-2.5 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/30 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400 sm:gap-2">
                      <TrendingDown className="size-3.5 shrink-0 sm:size-4" />
                      <p className="text-[9px] uppercase tracking-wider font-medium leading-tight sm:text-[11px]">
                        {t.budget.expensesLabel}
                      </p>
                    </div>
                    <p className="mt-1 truncate font-heading text-sm font-semibold text-orange-800 dark:text-orange-300 sm:text-xl">
                      {formatBudgetAmount(expenseTotal, lang)}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "border px-2 py-2.5 shadow-sm sm:px-4 sm:py-3",
                      balance >= 0
                        ? "border-border bg-card"
                        : "border-red-200/80 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 sm:gap-2",
                        balance >= 0
                          ? "text-muted-foreground"
                          : "text-red-700 dark:text-red-400"
                      )}
                    >
                      <Scale className="size-3.5 shrink-0 sm:size-4" />
                      <p className="text-[9px] uppercase tracking-wider font-medium leading-tight sm:text-[11px]">
                        {t.budget.balanceLabel}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "mt-1 truncate font-heading text-sm font-semibold sm:text-xl",
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
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                      <BudgetExpenseFormDialog
                        budgetId={activeBudgetId}
                        onSuccess={onDataChanged}
                        triggerClassName="w-full sm:w-auto"
                      />
                      <div className="min-w-0" data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_INCOME}>
                        <BudgetIncomeFormDialog
                          budgetId={activeBudgetId}
                          onSuccess={onDataChanged}
                          triggerClassName="w-full sm:w-auto"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <NimbusTourToolbarAnchor
                        tourTarget={NIMBUS_TOUR_TARGET.BUDGET_FILTERS}
                        visible={!!activeBudgetId}
                      >
                        <BudgetFilters
                          entries={monthlyEntries}
                          typeFilter={typeFilter}
                          categoryFilter={categoryFilter}
                          onTypeChange={handleTypeFilterChange}
                          onCategoryChange={setCategoryFilter}
                        />
                      </NimbusTourToolbarAnchor>
                      <div data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_WATCH}>
                        <BudgetWatchButton
                          budgetId={activeBudgetId}
                          compact
                          onChanged={onWatchChanged}
                        />
                      </div>
                      <div data-nimbus-tour={NIMBUS_TOUR_TARGET.BUDGET_EXPORT}>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="cursor-pointer sm:size-auto sm:px-3 sm:py-2"
                          onClick={handleExportCsv}
                          aria-label={t.module.exportCsv}
                        >
                          <Download className="size-4" />
                          <span className="hidden sm:inline">{t.module.exportCsv}</span>
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="cursor-pointer sm:size-auto sm:px-3 sm:py-2"
                        onClick={handlePrint}
                        aria-label={t.budget.printBtn}
                      >
                        <Printer className="size-4" />
                        <span className="hidden sm:inline">{t.budget.printBtn}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {(expenseCategoryTotals.length > 0 || incomeCategoryTotals.length > 0) && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 no-print">
                  {incomeCategoryTotals.map((row) => (
                    <div
                      key={`income-${row.category}`}
                      className="flex min-w-0 items-center justify-between gap-2 border border-border bg-card px-3 py-2 text-sm shadow-sm sm:block"
                    >
                      <p className="min-w-0 truncate text-[11px] text-muted-foreground">
                        {t.budget.incomeCategoryLabels[row.category as BudgetIncomeCategory]}
                      </p>
                      <p className="shrink-0 font-heading font-semibold text-primary">
                        +{formatBudgetAmount(row.total, lang)}
                      </p>
                    </div>
                  ))}
                  {expenseCategoryTotals.map((row) => (
                    <div
                      key={`expense-${row.category}`}
                      className="flex min-w-0 items-center justify-between gap-2 border border-border bg-card px-3 py-2 text-sm shadow-sm sm:block"
                    >
                      <p className="min-w-0 truncate text-[11px] text-muted-foreground">
                        {t.budget.categoryLabels[row.category as BudgetExpenseCategory]}
                      </p>
                      <p className="shrink-0 font-heading font-semibold text-orange-700 dark:text-orange-400">
                        −{formatBudgetAmount(row.total, lang)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="no-print space-y-3">
                <BudgetChartsLazy
                  entries={monthlyEntries}
                  typeFilter={typeFilter}
                  heading={t.budget.monthlyChartsHeading}
                />
              </div>

              {activeBudgetId && (
                <>
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
      </AppPage>

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
