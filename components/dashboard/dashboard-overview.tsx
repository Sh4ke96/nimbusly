"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { DashboardOverviewControls } from "@/components/dashboard/dashboard-overview-controls";
import {
  OverviewCardBody,
  getOverviewCardMeta,
} from "@/components/dashboard/dashboard-overview-card-bodies";
import { SortableOverviewCard } from "@/components/dashboard/sortable-overview-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { sortBirthdaysByUpcoming } from "@/lib/dashboard/birthdays";
import {
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { filterEntriesByMonth, getCurrentMonthKey } from "@/lib/budget/monthly";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import { BRAND_COLOR } from "@/lib/constants/brand";
import { BUDGET_EXPENSE_COLOR } from "@/lib/constants/budget";
import type { DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { parseEntryDateParts } from "@/lib/schedule/types";
import {
  getVisibleOverviewCardIds,
  normalizeDashboardOverviewLayout,
  parseDashboardOverviewLayout,
  reorderOverviewCards,
  serializeDashboardOverviewLayout,
  setOverviewCardHidden,
  type DashboardOverviewLayout,
} from "@/lib/dashboard/overview-layout";
import { useLang, useT } from "@/lib/lang-context";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { createClient } from "@/lib/supabase/client";
import { updateDashboardOverviewLayout } from "@/app/(app)/dashboard/actions";

export function DashboardOverview() {
  const t = useT();
  const { lang } = useLang();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const family = useProfileStore((s) => s.family);
  const patchDashboardOverviewLayout = useProfileStore(
    (s) => s.patchDashboardOverviewLayout
  );

  const budgets = useBudgetStore((s) => s.budgets);
  const expensesByBudgetId = useBudgetStore((s) => s.expensesByBudgetId);
  const budgetLoaded = useBudgetStore((s) => s.loaded);
  const budgetLoading = useBudgetStore((s) => s.loading);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);

  const lists = useShoppingListsStore((s) => s.lists);
  const listsLoaded = useShoppingListsStore((s) => s.loaded);
  const listsLoading = useShoppingListsStore((s) => s.loading);
  const fetchLists = useShoppingListsStore((s) => s.fetchLists);

  const gifts = useGiftsStore((s) => s.ideas);
  const giftsLoaded = useGiftsStore((s) => s.loaded);
  const giftsLoading = useGiftsStore((s) => s.loading);
  const fetchIdeas = useGiftsStore((s) => s.fetchIdeas);

  const medicineItems = useMedicineStore((s) => s.items);
  const medicineLoaded = useMedicineStore((s) => s.loaded);
  const medicineLoading = useMedicineStore((s) => s.loading);
  const fetchMedicineItems = useMedicineStore((s) => s.fetchItems);

  const scheduleEntries = useScheduleStore((s) => s.entries);
  const scheduleLoaded = useScheduleStore((s) => s.loaded);
  const scheduleLoading = useScheduleStore((s) => s.loading);
  const fetchSchedule = useScheduleStore((s) => s.fetchEntries);

  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [layout, setLayout] = useState<DashboardOverviewLayout>(() =>
    parseDashboardOverviewLayout(null)
  );
  const [savingLayout, setSavingLayout] = useState<boolean>(false);
  const layoutRef = useRef<DashboardOverviewLayout>(layout);

  const monthKey = getCurrentMonthKey();
  const now = new Date();
  const scheduleYear = now.getFullYear();
  const scheduleMonth = now.getMonth() + 1;

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    if (!profile) return;
    setLayout(parseDashboardOverviewLayout(profile.dashboard_overview_layout));
  }, [profile?.id, profile?.dashboard_overview_layout]);

  const persistLayout = useCallback(
    async (nextLayout: DashboardOverviewLayout, previousLayout: DashboardOverviewLayout) => {
      setLayout(nextLayout);
      setSavingLayout(true);
      patchDashboardOverviewLayout(nextLayout);

      const formData = new FormData();
      formData.set("layout", serializeDashboardOverviewLayout(nextLayout));

      const result = await updateDashboardOverviewLayout(null, formData);
      setSavingLayout(false);

      if (result && "error" in result) {
        setLayout(previousLayout);
        patchDashboardOverviewLayout(previousLayout);
        toast.error(result.error);
        return;
      }
    },
    [patchDashboardOverviewLayout]
  );

  const loadBirthdays = useCallback(async () => {
    setBirthdaysLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("birthday_entries")
      .select("*")
      .order("birth_month")
      .order("birth_day");
    setBirthdays((data ?? []) as BirthdayEntry[]);
    setBirthdaysLoading(false);
  }, []);

  useEffect(() => {
    if (!budgetLoaded && !budgetLoading) void fetchBudgets();
    if (!listsLoaded && !listsLoading) void fetchLists();
    if (!giftsLoaded && !giftsLoading) void fetchIdeas();
    if (!medicineLoaded && !medicineLoading) void fetchMedicineItems();
    if (!scheduleLoaded && !scheduleLoading) void fetchSchedule();
    void loadBirthdays();
  }, [
    budgetLoaded,
    budgetLoading,
    fetchBudgets,
    listsLoaded,
    listsLoading,
    fetchLists,
    giftsLoaded,
    giftsLoading,
    fetchIdeas,
    medicineLoaded,
    medicineLoading,
    fetchMedicineItems,
    scheduleLoaded,
    scheduleLoading,
    fetchSchedule,
    loadBirthdays,
  ]);

  const monthlyBudgetEntries = useMemo(() => {
    const all = budgets.flatMap((b) => expensesByBudgetId[b.id] ?? []);
    return filterEntriesByMonth(all, monthKey);
  }, [budgets, expensesByBudgetId, monthKey]);

  const incomeTotal = sumIncomeOnly(monthlyBudgetEntries);
  const expenseTotal = sumExpensesOnly(monthlyBudgetEntries);
  const balance = netBalance(monthlyBudgetEntries);

  const budgetChartData = useMemo(
    () =>
      [
        {
          key: "income",
          name: t.budget.incomeLabel,
          total: incomeTotal,
          fill: BRAND_COLOR.PRIMARY,
        },
        {
          key: "expense",
          name: t.budget.expensesLabel,
          total: expenseTotal,
          fill: BUDGET_EXPENSE_COLOR,
        },
      ].filter((row) => row.total > 0),
    [incomeTotal, expenseTotal, t.budget.incomeLabel, t.budget.expensesLabel]
  );

  const monthScheduleEntries = useMemo(
    () =>
      scheduleEntries.filter((entry) => {
        const parts = parseEntryDateParts(entry.entry_date);
        return parts.year === scheduleYear && parts.month === scheduleMonth;
      }),
    [scheduleEntries, scheduleYear, scheduleMonth]
  );

  const scheduleByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of monthScheduleEntries) {
      counts.set(entry.entry_type, (counts.get(entry.entry_type) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthScheduleEntries]);

  const upcomingBirthdays = useMemo(
    () => sortBirthdaysByUpcoming(birthdays).slice(0, 3),
    [birthdays]
  );

  const previewLists = useMemo(() => lists.slice(0, 3), [lists]);
  const previewGifts = useMemo(() => gifts.slice(0, 2), [gifts]);
  const expiringMedicines = useMemo(
    () => medicineItems.filter((item) => isMedicineExpiringSoon(item.expiry_date)),
    [medicineItems]
  );
  const previewMedicines = useMemo(
    () => expiringMedicines.slice(0, 3),
    [expiringMedicines]
  );

  const visibleCardIds = useMemo(
    () => getVisibleOverviewCardIds(layout),
    [layout]
  );

  const cardBodiesProps = useMemo(
    () => ({
      t,
      lang,
      profile,
      members,
      family,
      incomeTotal,
      expenseTotal,
      balance,
      budgetChartData,
      lists,
      previewLists,
      gifts,
      previewGifts,
      medicineItems,
      previewMedicines,
      expiringMedicinesCount: expiringMedicines.length,
      upcomingBirthdays,
      monthScheduleEntries,
      scheduleByType,
    }),
    [
      t,
      lang,
      profile,
      members,
      family,
      incomeTotal,
      expenseTotal,
      balance,
      budgetChartData,
      lists,
      previewLists,
      gifts,
      previewGifts,
      medicineItems,
      previewMedicines,
      expiringMedicines.length,
      upcomingBirthdays,
      monthScheduleEntries,
      scheduleByType,
    ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = layoutRef.current;
    const next = reorderOverviewCards(
      previous,
      active.id as DashboardOverviewCardId,
      over.id as DashboardOverviewCardId
    );
    await persistLayout(next, previous);
  }

  async function handleHideCard(cardId: DashboardOverviewCardId) {
    const previous = layoutRef.current;
    const next = setOverviewCardHidden(previous, cardId, true);
    await persistLayout(next, previous);
  }

  async function handleShowCard(cardId: DashboardOverviewCardId) {
    const previous = layoutRef.current;
    const next = setOverviewCardHidden(previous, cardId, false);
    await persistLayout(next, previous);
  }

  const loading =
    (budgetLoading && !budgetLoaded) ||
    (listsLoading && !listsLoaded) ||
    (giftsLoading && !giftsLoaded) ||
    (medicineLoading && !medicineLoaded) ||
    (scheduleLoading && !scheduleLoaded) ||
    birthdaysLoading;

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {t.dashboard.overviewHeading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-none" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <DashboardOverviewControls
        editMode={editMode}
        onEditModeChange={setEditMode}
        hiddenCardIds={layout.hidden}
        onShowCard={(cardId) => void handleShowCard(cardId)}
        saving={savingLayout}
      />

      {visibleCardIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border bg-muted/20 text-center">
          <LayoutGrid className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-sm">
            {t.dashboard.overviewAllHidden}
          </p>
          {editMode && layout.hidden.length > 0 && (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline cursor-pointer"
              onClick={() => {
                const previous = layoutRef.current;
                const next = normalizeDashboardOverviewLayout({
                  order: previous.order,
                  hidden: [],
                });
                void persistLayout(next, previous);
              }}
            >
              {t.dashboard.restoreAllOverviewCardsBtn}
            </button>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          <SortableContext items={visibleCardIds} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCardIds.map((cardId) => {
                const meta = getOverviewCardMeta(cardId, t.dashboard, profile);
                return (
                  <SortableOverviewCard
                    key={cardId}
                    cardId={cardId}
                    href={meta.href}
                    title={meta.title}
                    icon={meta.icon}
                    accent={meta.accent}
                    className={meta.className}
                    editMode={editMode}
                    onHide={() => void handleHideCard(cardId)}
                  >
                    <OverviewCardBody cardId={cardId} {...cardBodiesProps} />
                  </SortableOverviewCard>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
