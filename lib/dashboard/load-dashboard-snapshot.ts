import { ACCOUNT_MODE } from "@/lib/constants/account";
import { INVITATION_STATUS } from "@/lib/constants/family-invitation";
import { BUDGET_ENTRY_TYPE, BUDGET_RECURRENCE } from "@/lib/constants/budget";
import type { DashboardSnapshot } from "@/lib/dashboard/snapshot-types";
import type { Budget, BudgetExpense } from "@/lib/budget/types";
import { sortNoteCategories } from "@/lib/notes/types";
import { getAuthProfile } from "@/lib/profile/server";
import type { Family, FamilyInvitation, FamilyMember } from "@/lib/profile";
import { mapFamilyMemberRow } from "@/lib/supabase/row-mappers";
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

async function loadFamilyData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  userId: string,
  isFamilyAccount: boolean
): Promise<{
  family: Family | null;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
}> {
  const [{ data: family }, { data: members }] = await Promise.all([
    supabase.from("families").select("id, name, created_by, invite_code").eq("id", familyId).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_color, family_role")
      .eq("family_id", familyId),
  ]);

  let invitations: FamilyInvitation[] = [];
  if (isFamilyAccount && family?.created_by === userId) {
    const { data } = await supabase
      .from("family_invitations")
      .select("id, family_id, email, status, created_at, expires_at")
      .eq("family_id", familyId)
      .eq("status", INVITATION_STATUS.PENDING)
      .order("created_at", { ascending: false });
    invitations = (data ?? []) as FamilyInvitation[];
  }

  return {
    family: family ?? null,
    members: (members ?? []).map(mapFamilyMemberRow),
    invitations,
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
  ] = await Promise.all([
    profile.family_id
      ? loadFamilyData(
          supabase,
          profile.family_id,
          user.id,
          profile.account_mode === ACCOUNT_MODE.FAMILY
        )
      : Promise.resolve({ family: null, members: [], invitations: [] }),
    supabase.from("budgets").select("*").order("updated_at", { ascending: false }),
    supabase.from("shopping_lists").select("*").order("updated_at", { ascending: false }),
    supabase.from("gift_ideas").select("*").order("updated_at", { ascending: false }),
    supabase.from("medicine_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("watchlist_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("restaurant_places").select("*").order("updated_at", { ascending: false }),
    supabase.from("pets").select("*").order("name"),
    supabase.from("pet_care_items").select("*").order("updated_at", { ascending: false }),
    supabase.from("chore_tasks").select("*").order("updated_at", { ascending: false }),
    supabase.from("notes").select("*").order("updated_at", { ascending: false }),
    supabase.from("note_categories").select("*").order("sort_order"),
    supabase.from("schedule_entries").select("*").order("entry_date"),
    supabase.from("birthday_entries").select("*").order("birth_month"),
  ]);

  const budgets = mapBudgets((budgetsResult.data ?? []) as Budget[]);
  const budgetIds = budgets.map((budget) => budget.id);

  const expensesByBudgetId: Record<string, BudgetExpense[]> = {};
  const memberIdsByBudgetId: Record<string, string[]> = {};

  if (budgetIds.length > 0) {
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
  }

  return {
    user,
    profile: auth.profile,
    family: familyBundle.family,
    members: familyBundle.members,
    invitations: familyBundle.invitations,
    budgets,
    expensesByBudgetId,
    memberIdsByBudgetId,
    shoppingLists: (shoppingResult.data ?? []) as DashboardSnapshot["shoppingLists"],
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
