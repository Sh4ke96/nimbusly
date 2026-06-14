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
import { sortBirthdaysByUpcoming } from "@/lib/dashboard/birthdays";
import { buildAttentionItems } from "@/lib/dashboard/attention";
import { formatMessage } from "@/lib/i18n/format";
import { DashboardAttentionBanner } from "@/components/dashboard/dashboard-attention-banner";
import {
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { filterEntriesByMonth, getCurrentMonthKey } from "@/lib/budget/monthly";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import {
  countPlannedRestaurants,
  pickBestRecentRestaurants,
} from "@/lib/restaurants/dashboard";
import { countDuePetCareItems } from "@/lib/pets/filters";
import { pickDuePetCarePreview } from "@/lib/pets/dashboard";
import {
  countActiveChores,
  countOverdueChores,
  pickActiveChorePreview,
} from "@/lib/chores/dashboard";
import { WATCHLIST_STATUS } from "@/lib/constants/watchlist";
import { BRAND_COLOR } from "@/lib/constants/brand";
import { BUDGET_EXPENSE_COLOR } from "@/lib/constants/budget";
import type { DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { DASHBOARD_OVERVIEW_CARD } from "@/lib/constants/dashboard-overview";
import { parseEntryDateParts } from "@/lib/schedule/types";
import {
  parseDashboardOverviewLayout,
  serializeDashboardOverviewLayout,
  reorderOverviewCards,
  setOverviewCardHidden,
  type DashboardOverviewLayout,
  getVisibleOverviewCardIds,
  normalizeDashboardOverviewLayout,
} from "@/lib/dashboard/overview-layout";
import { useLang, useT } from "@/lib/lang-context";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
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
  const budgetError = useBudgetStore((s) => s.error);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);

  const lists = useShoppingListsStore((s) => s.lists);
  const listsLoaded = useShoppingListsStore((s) => s.loaded);
  const listsLoading = useShoppingListsStore((s) => s.loading);
  const listsError = useShoppingListsStore((s) => s.error);
  const fetchLists = useShoppingListsStore((s) => s.fetchLists);

  const gifts = useGiftsStore((s) => s.ideas);
  const giftsLoaded = useGiftsStore((s) => s.loaded);
  const giftsLoading = useGiftsStore((s) => s.loading);
  const giftsError = useGiftsStore((s) => s.error);
  const fetchIdeas = useGiftsStore((s) => s.fetchIdeas);

  const medicineItems = useMedicineStore((s) => s.items);
  const medicineLoaded = useMedicineStore((s) => s.loaded);
  const medicineLoading = useMedicineStore((s) => s.loading);
  const medicineError = useMedicineStore((s) => s.error);
  const fetchMedicineItems = useMedicineStore((s) => s.fetchItems);

  const watchlistItems = useWatchlistStore((s) => s.items);
  const watchlistLoaded = useWatchlistStore((s) => s.loaded);
  const watchlistLoading = useWatchlistStore((s) => s.loading);
  const watchlistError = useWatchlistStore((s) => s.error);
  const fetchWatchlistItems = useWatchlistStore((s) => s.fetchItems);

  const restaurantPlaces = useRestaurantsStore((s) => s.places);
  const restaurantsLoaded = useRestaurantsStore((s) => s.loaded);
  const restaurantsLoading = useRestaurantsStore((s) => s.loading);
  const restaurantsError = useRestaurantsStore((s) => s.error);
  const fetchRestaurantPlaces = useRestaurantsStore((s) => s.fetchPlaces);

  const pets = usePetsStore((s) => s.pets);
  const careItems = usePetsStore((s) => s.careItems);
  const petsLoaded = usePetsStore((s) => s.loaded);
  const petsLoading = usePetsStore((s) => s.loading);
  const petsError = usePetsStore((s) => s.error);
  const fetchPets = usePetsStore((s) => s.fetchAll);

  const choreTasks = useChoresStore((s) => s.tasks);
  const choresLoaded = useChoresStore((s) => s.loaded);
  const choresLoading = useChoresStore((s) => s.loading);
  const choresError = useChoresStore((s) => s.error);
  const fetchChores = useChoresStore((s) => s.fetchTasks);

  const scheduleEntries = useScheduleStore((s) => s.entries);
  const scheduleLoaded = useScheduleStore((s) => s.loaded);
  const scheduleLoading = useScheduleStore((s) => s.loading);
  const scheduleError = useScheduleStore((s) => s.error);
  const fetchSchedule = useScheduleStore((s) => s.fetchEntries);

  const birthdays = useBirthdaysStore((s) => s.entries);
  const birthdaysLoaded = useBirthdaysStore((s) => s.loaded);
  const birthdaysLoading = useBirthdaysStore((s) => s.loading);
  const birthdaysError = useBirthdaysStore((s) => s.error);
  const fetchBirthdays = useBirthdaysStore((s) => s.fetchEntries);

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

  const profileLayoutKey = profile
    ? serializeDashboardOverviewLayout(
        parseDashboardOverviewLayout(profile.dashboard_overview_layout)
      )
    : null;

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    if (!profileLayoutKey) return;
    setLayout(parseDashboardOverviewLayout(JSON.parse(profileLayoutKey)));
  }, [profile?.id, profileLayoutKey]);

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

  useEffect(() => {
    if (!profile?.id) return;

    void fetchBudgets();
    void fetchLists();
    void fetchIdeas();
    void fetchMedicineItems();
    void fetchWatchlistItems();
    void fetchRestaurantPlaces();
    void fetchPets();
    void fetchChores();
    void fetchSchedule();
    void fetchBirthdays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

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
  const activeWatchlistItems = useMemo(
    () =>
      watchlistItems.filter(
        (item) =>
          item.status === WATCHLIST_STATUS.TO_WATCH ||
          item.status === WATCHLIST_STATUS.WATCHING
      ),
    [watchlistItems]
  );
  const previewWatchlistItems = useMemo(
    () => activeWatchlistItems.slice(0, 3),
    [activeWatchlistItems]
  );
  const plannedRestaurantCount = useMemo(
    () => countPlannedRestaurants(restaurantPlaces),
    [restaurantPlaces]
  );
  const previewRestaurantPlaces = useMemo(
    () => pickBestRecentRestaurants(restaurantPlaces, 3),
    [restaurantPlaces]
  );
  const duePetCareCount = useMemo(
    () => countDuePetCareItems(careItems),
    [careItems]
  );
  const previewDuePetCare = useMemo(
    () => pickDuePetCarePreview(careItems, pets, 3),
    [careItems, pets]
  );
  const activeChoreCount = useMemo(
    () => countActiveChores(choreTasks),
    [choreTasks]
  );
  const overdueChoreCount = useMemo(
    () => countOverdueChores(choreTasks),
    [choreTasks]
  );
  const previewChoreTasks = useMemo(
    () => pickActiveChorePreview(choreTasks, 3),
    [choreTasks]
  );

  const attentionItems = useMemo(
    () =>
      buildAttentionItems({
        choreTasks,
        medicineItems,
        careItems,
        pets,
        birthdays,
        labels: {
          choreOverdue: (title) =>
            formatMessage(t.dashboard.attentionChoreOverdue, { title }),
          medicineExpiring: (name) =>
            formatMessage(t.dashboard.attentionMedicineExpiring, { name }),
          petCareDue: (pet, item) =>
            formatMessage(t.dashboard.attentionPetCareDue, { pet, item }),
          birthdaySoon: (name, when) =>
            formatMessage(t.dashboard.attentionBirthdaySoon, { name, when }),
          birthdayToday: t.dashboard.birthdayToday,
          birthdayInDays: (count) =>
            formatMessage(t.dashboard.birthdayInDays, { count }),
        },
        limit: undefined,
      }),
    [choreTasks, medicineItems, careItems, pets, birthdays, t.dashboard]
  );

  const cardErrorById = useMemo(
    (): Record<DashboardOverviewCardId, boolean> => ({
      [DASHBOARD_OVERVIEW_CARD.BUDGET]: budgetError,
      [DASHBOARD_OVERVIEW_CARD.SHOPPING]: listsError,
      [DASHBOARD_OVERVIEW_CARD.GIFTS]: giftsError,
      [DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET]: medicineError,
      [DASHBOARD_OVERVIEW_CARD.WATCHLIST]: watchlistError,
      [DASHBOARD_OVERVIEW_CARD.RESTAURANTS]: restaurantsError,
      [DASHBOARD_OVERVIEW_CARD.PETS]: petsError,
      [DASHBOARD_OVERVIEW_CARD.CHORES]: choresError,
      [DASHBOARD_OVERVIEW_CARD.BIRTHDAYS]: birthdaysError,
      [DASHBOARD_OVERVIEW_CARD.CALENDAR]: scheduleError,
      [DASHBOARD_OVERVIEW_CARD.FAMILY]: false,
    }),
    [
      budgetError,
      listsError,
      giftsError,
      medicineError,
      watchlistError,
      restaurantsError,
      petsError,
      choresError,
      birthdaysError,
      scheduleError,
    ]
  );

  const cardRetryById = useMemo(
    (): Record<DashboardOverviewCardId, () => void> => ({
      [DASHBOARD_OVERVIEW_CARD.BUDGET]: () => void fetchBudgets(true),
      [DASHBOARD_OVERVIEW_CARD.SHOPPING]: () => void fetchLists(true),
      [DASHBOARD_OVERVIEW_CARD.GIFTS]: () => void fetchIdeas(true),
      [DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET]: () => void fetchMedicineItems(true),
      [DASHBOARD_OVERVIEW_CARD.WATCHLIST]: () => void fetchWatchlistItems(true),
      [DASHBOARD_OVERVIEW_CARD.RESTAURANTS]: () => void fetchRestaurantPlaces(true),
      [DASHBOARD_OVERVIEW_CARD.PETS]: () => void fetchPets(true),
      [DASHBOARD_OVERVIEW_CARD.CHORES]: () => void fetchChores(true),
      [DASHBOARD_OVERVIEW_CARD.BIRTHDAYS]: () => void fetchBirthdays(true),
      [DASHBOARD_OVERVIEW_CARD.CALENDAR]: () => void fetchSchedule(true),
      [DASHBOARD_OVERVIEW_CARD.FAMILY]: () => {},
    }),
    [
      fetchBudgets,
      fetchLists,
      fetchIdeas,
      fetchMedicineItems,
      fetchWatchlistItems,
      fetchRestaurantPlaces,
      fetchPets,
      fetchChores,
      fetchBirthdays,
      fetchSchedule,
    ]
  );

  const cardLoadingById = useMemo(
    (): Record<DashboardOverviewCardId, boolean> => ({
      [DASHBOARD_OVERVIEW_CARD.BUDGET]: !budgetLoaded && budgetLoading,
      [DASHBOARD_OVERVIEW_CARD.SHOPPING]: !listsLoaded && listsLoading,
      [DASHBOARD_OVERVIEW_CARD.GIFTS]: !giftsLoaded && giftsLoading,
      [DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET]: !medicineLoaded && medicineLoading,
      [DASHBOARD_OVERVIEW_CARD.WATCHLIST]: !watchlistLoaded && watchlistLoading,
      [DASHBOARD_OVERVIEW_CARD.RESTAURANTS]: !restaurantsLoaded && restaurantsLoading,
      [DASHBOARD_OVERVIEW_CARD.PETS]: !petsLoaded && petsLoading,
      [DASHBOARD_OVERVIEW_CARD.CHORES]: !choresLoaded && choresLoading,
      [DASHBOARD_OVERVIEW_CARD.BIRTHDAYS]: !birthdaysLoaded && birthdaysLoading,
      [DASHBOARD_OVERVIEW_CARD.CALENDAR]: !scheduleLoaded && scheduleLoading,
      [DASHBOARD_OVERVIEW_CARD.FAMILY]: false,
    }),
    [
      budgetLoaded,
      budgetLoading,
      listsLoaded,
      listsLoading,
      giftsLoaded,
      giftsLoading,
      medicineLoaded,
      medicineLoading,
      watchlistLoaded,
      watchlistLoading,
      restaurantsLoaded,
      restaurantsLoading,
      petsLoaded,
      petsLoading,
      choresLoaded,
      choresLoading,
      birthdaysLoaded,
      birthdaysLoading,
      scheduleLoaded,
      scheduleLoading,
    ]
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
      watchlistItems,
      previewWatchlistItems,
      toWatchCount: activeWatchlistItems.length,
      restaurantPlaces,
      previewRestaurantPlaces,
      plannedRestaurantCount,
      pets,
      careItems,
      duePetCareCount,
      previewDuePetCare,
      activeChoreCount,
      overdueChoreCount,
      previewChoreTasks,
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
      watchlistItems,
      previewWatchlistItems,
      activeWatchlistItems.length,
      restaurantPlaces,
      previewRestaurantPlaces,
      plannedRestaurantCount,
      pets,
      careItems,
      duePetCareCount,
      previewDuePetCare,
      activeChoreCount,
      overdueChoreCount,
      previewChoreTasks,
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

  return (
    <section className="space-y-4">
      <DashboardOverviewControls
        editMode={editMode}
        onEditModeChange={setEditMode}
        hiddenCardIds={layout.hidden}
        onShowCard={(cardId) => void handleShowCard(cardId)}
        saving={savingLayout}
      />

      <DashboardAttentionBanner items={attentionItems} />

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
                    <OverviewCardBody
                      cardId={cardId}
                      cardLoading={cardLoadingById[cardId]}
                      cardError={cardErrorById[cardId]}
                      onCardRetry={cardRetryById[cardId]}
                      {...cardBodiesProps}
                    />
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
