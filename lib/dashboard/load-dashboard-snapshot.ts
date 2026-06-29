import { ACCOUNT_MODE } from "@/lib/constants/account";
import { BUDGET_ENTRY_TYPE, BUDGET_RECURRENCE } from "@/lib/constants/budget";
import type { DashboardSnapshot } from "@/lib/dashboard/snapshot-types";
import type { Budget, BudgetExpense } from "@/lib/budget/types";
import { loadFamilyBundle } from "@/lib/family/load-family-bundle";
import { sortNoteCategories } from "@/lib/notes/types";
import { sortShoppingListCategories } from "@/lib/shopping-lists/categories";
import { sortShoppingListItems, type ShoppingListItem } from "@/lib/shopping-lists/types";
import type { AppNotification } from "@/lib/notifications/types";
import { getAuthProfile } from "@/lib/profile/server";
import { createClient } from "@/lib/supabase/server";

function mapExpenseAmounts(rows: BudgetExpense[]): BudgetExpense[] {
  return rows.map((row) => ({
    ...row,
    entry_type: row.entry_type ?? BUDGET_ENTRY_TYPE.EXPENSE,
    recurrence: row.recurrence ?? BUDGET_RECURRENCE.NONE,
    recurrence_interval_days: row.recurrence_interval_days ?? null,
    recurrence_end_date: row.recurrence_end_date ?? null,
    payment_reminder_enabled: row.payment_reminder_enabled ?? false,
    reminder_sent_keys: row.reminder_sent_keys ?? [],
    amount: Number(row.amount),
  }));
}

function mapBudgets(rows: Budget[]): Budget[] {
  return rows.map((row) => ({
    ...row,
    is_hidden: row.is_hidden ?? false,
  }));
}

function mapNotificationRow(row: AppNotification): AppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    payload: row.payload ?? {},
    read_at: row.read_at,
    created_at: row.created_at,
  };
}

export async function loadDashboardSnapshot(): Promise<DashboardSnapshot | null> {
  const auth = await getAuthProfile();
  if (!auth?.user || !auth.profile) {
    return null;
  }

  const supabase = await createClient();
  const { user } = auth;
  const profile = auth.profile;

  const [
    familyBundle,
    budgetsResult,
    shoppingResult,
    shoppingCategoriesResult,
    giftsResult,
    medicineResult,
    watchlistResult,
    restaurantsResult,
    petsResult,
    careResult,
    choresResult,
    notesResult,
    noteCategoriesResult,
    scheduleResult,
    birthdaysResult,
    notificationsResult,
    unreadCountResult,
  ] = await Promise.all([
    profile.family_id
      ? loadFamilyBundle(
          supabase,
          profile.family_id,
          user.id,
          profile.account_mode === ACCOUNT_MODE.FAMILY
        )
      : Promise.resolve({ family: null, members: [], invitations: [] }),
    supabase.from("budgets").select("*").order("updated_at", { ascending: false }),
    supabase.from("shopping_lists").select("*").order("updated_at", { ascending: false }),
    supabase.from("shopping_list_categories").select("*").order("sort_order"),
    supabase.from("gift_ideas").select("*").order("updated_at", { ascending: false }),
    supabase.from("medicine_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("watchlist_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("restaurant_places").select("*").order("updated_at", { ascending: false }),
    supabase.from("pets").select("*").order("name"),
    supabase.from("pet_care_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("chore_tasks").select("*").order("updated_at", { ascending: false }),
    supabase.from("notes").select("*").order("is_pinned", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("note_categories").select("*").order("sort_order"),
    supabase.from("schedule_entries").select("*").order("entry_date"),
    supabase.from("birthday_entries").select("*").order("birth_month"),
    supabase
      .from("notifications")
      .select("id, user_id, type, title, body, payload, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  const budgets = mapBudgets((budgetsResult.data ?? []) as Budget[]);
  const budgetIds = budgets.map((budget) => budget.id);
  const shoppingLists = (shoppingResult.data ?? []) as DashboardSnapshot["shoppingLists"];
  const listIds = shoppingLists.map((list) => list.id);

  const expensesByBudgetId: Record<string, BudgetExpense[]> = {};
  const memberIdsByBudgetId: Record<string, string[]> = {};
  const itemsByListId: Record<string, ShoppingListItem[]> = {};

  const secondaryQueries: Promise<void>[] = [];

  if (budgetIds.length > 0) {
    secondaryQueries.push(
      (async () => {
        const [expensesResult, membersResult] = await Promise.all([
          supabase
            .from("budget_expenses")
            .select("*")
            .in("budget_id", budgetIds)
            .order("expense_date", { ascending: false }),
          supabase.from("budget_members").select("budget_id, member_id").in("budget_id", budgetIds),
        ]);

        for (const budgetId of budgetIds) {
          expensesByBudgetId[budgetId] = [];
          memberIdsByBudgetId[budgetId] = [];
        }

        for (const expense of mapExpenseAmounts((expensesResult.data ?? []) as BudgetExpense[])) {
          if (expensesByBudgetId[expense.budget_id]) {
            expensesByBudgetId[expense.budget_id].push(expense);
          }
        }

        for (const row of membersResult.data ?? []) {
          const budgetId = row.budget_id as string;
          const memberId = row.member_id as string;
          if (memberIdsByBudgetId[budgetId]) {
            memberIdsByBudgetId[budgetId].push(memberId);
          }
        }
      })()
    );
  }

  if (listIds.length > 0) {
    secondaryQueries.push(
      (async () => {
        const { data } = await supabase
          .from("shopping_list_items")
          .select("*")
          .in("list_id", listIds)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        for (const listId of listIds) {
          itemsByListId[listId] = [];
        }

        for (const item of (data ?? []) as ShoppingListItem[]) {
          if (itemsByListId[item.list_id]) {
            itemsByListId[item.list_id].push(item);
          }
        }

        for (const listId of listIds) {
          itemsByListId[listId] = sortShoppingListItems(itemsByListId[listId] ?? []);
        }
      })()
    );
  }

  await Promise.all(secondaryQueries);

  return {
    user,
    profile: auth.profile,
    family: familyBundle.family,
    members: familyBundle.members,
    invitations: familyBundle.invitations,
    budgets,
    expensesByBudgetId,
    memberIdsByBudgetId,
    shoppingLists,
    shoppingCategories: sortShoppingListCategories(
      (shoppingCategoriesResult.data ?? []) as DashboardSnapshot["shoppingCategories"]
    ),
    itemsByListId,
    notifications: (notificationsResult.data ?? []).map((row) =>
      mapNotificationRow(row as AppNotification)
    ),
    notificationsUnreadCount: unreadCountResult.count ?? 0,
    gifts: (giftsResult.data ?? []) as DashboardSnapshot["gifts"],
    medicineItems: (medicineResult.data ?? []) as DashboardSnapshot["medicineItems"],
    watchlistItems: (watchlistResult.data ?? []) as DashboardSnapshot["watchlistItems"],
    restaurantPlaces: (restaurantsResult.data ?? []) as DashboardSnapshot["restaurantPlaces"],
    pets: (petsResult.data ?? []) as DashboardSnapshot["pets"],
    petCareItems: (careResult.data ?? []) as DashboardSnapshot["petCareItems"],
    chores: (choresResult.data ?? []) as DashboardSnapshot["chores"],
    notes: (notesResult.data ?? []) as DashboardSnapshot["notes"],
    noteCategories: sortNoteCategories(
      (noteCategoriesResult.data ?? []) as DashboardSnapshot["noteCategories"]
    ),
    scheduleEntries: (scheduleResult.data ?? []) as DashboardSnapshot["scheduleEntries"],
    birthdays: (birthdaysResult.data ?? []) as DashboardSnapshot["birthdays"],
  };
}
