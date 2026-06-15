"use client";

import { DASHBOARD_FORM_FIELD } from "@/lib/dashboard/form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import type { DragEndEvent } from "@dnd-kit/core";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { DashboardOverviewControls } from "@/components/dashboard/dashboard-overview-controls";
import { sortBirthdaysByUpcoming } from "@/lib/dashboard/birthdays";
import { buildAttentionItems, sortAttentionItems } from "@/lib/dashboard/attention";
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
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { scheduleEntryOverlapsMonth } from "@/lib/schedule/types";
import {
  parseDashboardOverviewLayout,
  serializeDashboardOverviewLayout,
  reorderOverviewCards,
  setOverviewCardHidden,
  type DashboardOverviewLayout,
  getVisibleOverviewCardIds,
  normalizeDashboardOverviewLayout,
  toggleAttentionItemPin,
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
import { useNotesStore } from "@/lib/stores/notes-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { updateDashboardOverviewLayout } from "@/app/(app)/dashboard/actions";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardOverviewCardGrid = dynamic(
  () =>
    import("@/components/dashboard/dashboard-overview-card-grid").then(
      (m) => m.DashboardOverviewCardGrid
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-none" />
        <Skeleton className="h-48 w-full rounded-none" />
        <Skeleton className="h-48 w-full rounded-none" />
      </div>
    ),
  }
);

export function DashboardOverview() {
  const t = useT();
  const { lang } = useLang();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const family = useProfileStore((s) => s.family);
  const patchDashboardOverviewLayout = useProfileStore(
    (s) => s.patchDashboardOverviewLayout
  );

  const {
    budgets,
    expensesByBudgetId,
    loaded: budgetLoaded,
    loading: budgetLoading,
    error: budgetError,
    fetchBudgets,
  } = useBudgetStore(
    useShallow((s) => ({
      budgets: s.budgets,
      expensesByBudgetId: s.expensesByBudgetId,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchBudgets: s.fetchBudgets,
    }))
  );

  const {
    lists,
    loaded: listsLoaded,
    loading: listsLoading,
    error: listsError,
    fetchLists,
  } = useShoppingListsStore(
    useShallow((s) => ({
      lists: s.lists,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchLists: s.fetchLists,
    }))
  );

  const {
    ideas: gifts,
    loaded: giftsLoaded,
    loading: giftsLoading,
    error: giftsError,
    fetchIdeas,
  } = useGiftsStore(
    useShallow((s) => ({
      ideas: s.ideas,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchIdeas: s.fetchIdeas,
    }))
  );

  const {
    items: medicineItems,
    loaded: medicineLoaded,
    loading: medicineLoading,
    error: medicineError,
    fetchItems: fetchMedicineItems,
  } = useMedicineStore(
    useShallow((s) => ({
      items: s.items,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchItems: s.fetchItems,
    }))
  );

  const {
    items: watchlistItems,
    loaded: watchlistLoaded,
    loading: watchlistLoading,
    error: watchlistError,
    fetchItems: fetchWatchlistItems,
  } = useWatchlistStore(
    useShallow((s) => ({
      items: s.items,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchItems: s.fetchItems,
    }))
  );

  const {
    places: restaurantPlaces,
    loaded: restaurantsLoaded,
    loading: restaurantsLoading,
    error: restaurantsError,
    fetchPlaces: fetchRestaurantPlaces,
  } = useRestaurantsStore(
    useShallow((s) => ({
      places: s.places,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchPlaces: s.fetchPlaces,
    }))
  );

  const {
    pets,
    careItems,
    loaded: petsLoaded,
    loading: petsLoading,
    error: petsError,
    fetchAll: fetchPets,
  } = usePetsStore(
    useShallow((s) => ({
      pets: s.pets,
      careItems: s.careItems,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchAll: s.fetchAll,
    }))
  );

  const {
    tasks: choreTasks,
    loaded: choresLoaded,
    loading: choresLoading,
    error: choresError,
    fetchTasks: fetchChores,
  } = useChoresStore(
    useShallow((s) => ({
      tasks: s.tasks,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchTasks: s.fetchTasks,
    }))
  );

  const {
    notes,
    loaded: notesLoaded,
    loading: notesLoading,
    error: notesError,
    fetchNotes,
  } = useNotesStore(
    useShallow((s) => ({
      notes: s.notes,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchNotes: s.fetchNotes,
    }))
  );

  const {
    entries: scheduleEntries,
    loaded: scheduleLoaded,
    loading: scheduleLoading,
    error: scheduleError,
    fetchEntries: fetchSchedule,
  } = useScheduleStore(
    useShallow((s) => ({
      entries: s.entries,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchEntries: s.fetchEntries,
    }))
  );

  const {
    entries: birthdays,
    loaded: birthdaysLoaded,
    loading: birthdaysLoading,
    error: birthdaysError,
    fetchEntries: fetchBirthdays,
  } = useBirthdaysStore(
    useShallow((s) => ({
      entries: s.entries,
      loaded: s.loaded,
      loading: s.loading,
      error: s.error,
      fetchEntries: s.fetchEntries,
    }))
  );

  const [editMode, setEditMode] = useState<boolean>(false);
  const [savingLayout, setSavingLayout] = useState<boolean>(false);
  const layoutRef = useRef<DashboardOverviewLayout>(parseDashboardOverviewLayout(null));

  const monthKey = getCurrentMonthKey();
  const now = new Date();
  const scheduleYear = now.getFullYear();
  const scheduleMonth = now.getMonth() + 1;

  const profileLayoutKey = profile
    ? serializeDashboardOverviewLayout(
        parseDashboardOverviewLayout(profile.dashboard_overview_layout)
      )
    : null;

  const profileLayout = useMemo(
    () =>
      profileLayoutKey
        ? parseDashboardOverviewLayout(JSON.parse(profileLayoutKey))
        : parseDashboardOverviewLayout(null),
    [profileLayoutKey]
  );

  const [layoutDraft, setLayoutDraft] = useState<DashboardOverviewLayout | null>(null);
  const [layoutDraftSourceKey, setLayoutDraftSourceKey] = useState<string | null>(null);

  if (profileLayoutKey !== layoutDraftSourceKey) {
    setLayoutDraftSourceKey(profileLayoutKey);
    setLayoutDraft(null);
  }

  const layout = layoutDraft ?? profileLayout;

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const visibleCardIds = useMemo(
    () => getVisibleOverviewCardIds(layout),
    [layout]
  );
  const visibleCardKey = visibleCardIds.join("|");

  const persistLayout = useCallback(
    async (nextLayout: DashboardOverviewLayout, previousLayout: DashboardOverviewLayout) => {
      setLayoutDraft(nextLayout);
      setSavingLayout(true);
      patchDashboardOverviewLayout(nextLayout);

      const formData = new FormData();
      formData.set(DASHBOARD_FORM_FIELD.LAYOUT, serializeDashboardOverviewLayout(nextLayout));

      const result = await updateDashboardOverviewLayout(null, formData);
      setSavingLayout(false);

      if (result && "error" in result) {
        setLayoutDraft(previousLayout);
        patchDashboardOverviewLayout(previousLayout);
        toast.error(result.error);
        return;
      }
    },
    [patchDashboardOverviewLayout]
  );

  useEffect(() => {
    if (!profile?.id) return;

    const loaders: Partial<Record<DashboardOverviewCardId, () => void>> = {
      [DASHBOARD_OVERVIEW_CARD.BUDGET]: () => void fetchBudgets(),
      [DASHBOARD_OVERVIEW_CARD.SHOPPING]: () => void fetchLists(),
      [DASHBOARD_OVERVIEW_CARD.GIFTS]: () => void fetchIdeas(),
      [DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET]: () => void fetchMedicineItems(),
      [DASHBOARD_OVERVIEW_CARD.WATCHLIST]: () => void fetchWatchlistItems(),
      [DASHBOARD_OVERVIEW_CARD.RESTAURANTS]: () => void fetchRestaurantPlaces(),
      [DASHBOARD_OVERVIEW_CARD.PETS]: () => void fetchPets(),
      [DASHBOARD_OVERVIEW_CARD.CHORES]: () => void fetchChores(),
      [DASHBOARD_OVERVIEW_CARD.NOTES]: () => void fetchNotes(),
      [DASHBOARD_OVERVIEW_CARD.CALENDAR]: () => void fetchSchedule(),
      [DASHBOARD_OVERVIEW_CARD.BIRTHDAYS]: () => void fetchBirthdays(),
    };

    for (const cardId of visibleCardIds) {
      loaders[cardId]?.();
    }
  }, [
    profile?.id,
    visibleCardKey,
    visibleCardIds,
    fetchBudgets,
    fetchLists,
    fetchIdeas,
    fetchMedicineItems,
    fetchWatchlistItems,
    fetchRestaurantPlaces,
    fetchPets,
    fetchChores,
    fetchNotes,
    fetchSchedule,
    fetchBirthdays,
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
      scheduleEntries.filter((entry) =>
        scheduleEntryOverlapsMonth(entry, scheduleYear, scheduleMonth)
      ),
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
  const previewNotes = useMemo(() => notes.slice(0, 2), [notes]);

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

  const allBudgetExpenses = useMemo(
    () => Object.values(expensesByBudgetId).flat(),
    [expensesByBudgetId]
  );

  const attentionItems = useMemo(() => {
    const items = buildAttentionItems({
      choreTasks,
      medicineItems,
      careItems,
      pets,
      birthdays,
      budgetExpenses: allBudgetExpenses,
      scheduleEntries,
      notes,
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
        budgetPaymentDue: (description) =>
          formatMessage(t.dashboard.attentionBudgetPaymentDue, { description }),
        scheduleEnding: (description) =>
          formatMessage(t.dashboard.attentionScheduleEnding, { description }),
        noteUrgent: (title) =>
          formatMessage(t.dashboard.attentionNoteUrgent, { title }),
      },
      limit: 100,
    });

    const pinnedKeys = (layout.attentionPinned ?? []).filter((pinKey) =>
      items.some((item) => item.pinKey === pinKey)
    );

    return sortAttentionItems(items, pinnedKeys);
  }, [
    choreTasks,
    medicineItems,
    careItems,
    pets,
    birthdays,
    allBudgetExpenses,
    scheduleEntries,
    notes,
    layout.attentionPinned,
    t.dashboard,
  ]);

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
      [DASHBOARD_OVERVIEW_CARD.NOTES]: notesError,
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
      notesError,
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
      [DASHBOARD_OVERVIEW_CARD.NOTES]: () => void fetchNotes(true),
      [DASHBOARD_OVERVIEW_CARD.BIRTHDAYS]: () => void fetchBirthdays(true),
      [DASHBOARD_OVERVIEW_CARD.CALENDAR]: () => void fetchSchedule(true),
      [DASHBOARD_OVERVIEW_CARD.FAMILY]: () => { },
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
      fetchNotes,
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
      [DASHBOARD_OVERVIEW_CARD.NOTES]: !notesLoaded && notesLoading,
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
      notesLoaded,
      notesLoading,
      birthdaysLoaded,
      birthdaysLoading,
      scheduleLoaded,
      scheduleLoading,
    ]
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
      notes,
      previewNotes,
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
      notes,
      previewNotes,
      upcomingBirthdays,
      monthScheduleEntries,
      scheduleByType,
    ]
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

  async function handleToggleAttentionPin(pinKey: string) {
    const previous = layoutRef.current;
    const next = toggleAttentionItemPin(previous, pinKey);
    await persistLayout(next, previous);
  }

  return (
    <section className="space-y-4">
      <div data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_ATTENTION}>
        <DashboardAttentionBanner
          items={attentionItems}
          pinnedKeys={layout.attentionPinned ?? []}
          onTogglePin={(pinKey) => void handleToggleAttentionPin(pinKey)}
        />
      </div>

      <DashboardOverviewControls
        editMode={editMode}
        onEditModeChange={setEditMode}
        hiddenCardIds={layout.hidden}
        onShowCard={(cardId) => void handleShowCard(cardId)}
        saving={savingLayout}
      />

      {visibleCardIds.length === 0 ? (
        <div
          data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_OVERVIEW}
          className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border bg-muted/20 text-center"
        >
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
        <div data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_OVERVIEW}>
          <DashboardOverviewCardGrid
          visibleCardIds={visibleCardIds}
          editMode={editMode}
          profile={profile}
          cardLoadingById={cardLoadingById}
          cardErrorById={cardErrorById}
          cardRetryById={cardRetryById}
          cardBodiesProps={cardBodiesProps}
          onDragEnd={(event) => void handleDragEnd(event)}
          onHideCard={(cardId) => void handleHideCard(cardId)}
        />
        </div>
      )}
    </section>
  );
}
