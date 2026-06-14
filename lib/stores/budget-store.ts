import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { BUDGET_ENTRY_TYPE } from "@/lib/constants/budget";
import type { Budget, BudgetExpense } from "@/lib/budget/types";
import { watchedBudgetIdsFromRows } from "@/lib/budget/watches";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

export const EMPTY_BUDGET_EXPENSES: BudgetExpense[] = [];
export const EMPTY_BUDGET_MEMBER_IDS: string[] = [];

export function selectBudgetExpenses(
  budgetId: string
): (state: BudgetStore) => BudgetExpense[] {
  return (state) => state.expensesByBudgetId[budgetId] ?? EMPTY_BUDGET_EXPENSES;
}

export function selectBudgetMemberIds(
  budgetId: string
): (state: BudgetStore) => string[] {
  return (state) => state.memberIdsByBudgetId[budgetId] ?? EMPTY_BUDGET_MEMBER_IDS;
}

export function selectIsBudgetWatched(
  budgetId: string
): (state: BudgetStore) => boolean {
  return (state) => state.watchedBudgetIds.includes(budgetId);
}

interface BudgetStore {
  budgets: Budget[];
  expensesByBudgetId: Record<string, BudgetExpense[]>;
  memberIdsByBudgetId: Record<string, string[]>;
  watchedBudgetIds: string[];
  loaded: boolean;
  watchesLoaded: boolean;
  loading: boolean;
  fetchBudgets: (force?: boolean) => Promise<void>;
  fetchWatches: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  budgets: [] as Budget[],
  expensesByBudgetId: {} as Record<string, BudgetExpense[]>,
  memberIdsByBudgetId: {} as Record<string, string[]>,
  watchedBudgetIds: [] as string[],
  loaded: false,
  watchesLoaded: false,
  loading: false,
};

function sortBudgets(budgets: Budget[]): Budget[] {
  return [...budgets].sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

function sortExpenses(expenses: BudgetExpense[]): BudgetExpense[] {
  return [...expenses].sort((a, b) => {
    const dateCmp = b.expense_date.localeCompare(a.expense_date);
    if (dateCmp !== 0) return dateCmp;
    return b.created_at.localeCompare(a.created_at);
  });
}

function mapExpenseAmounts(rows: BudgetExpense[]): BudgetExpense[] {
  return rows.map((row) => ({
    ...row,
    entry_type: row.entry_type ?? BUDGET_ENTRY_TYPE.EXPENSE,
    amount: Number(row.amount),
  }));
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  ...initialState,

  fetchBudgets: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("budget:list", async () => {
      set({ loading: true });
      const supabase = createClient();

      const { data: budgets } = await supabase
        .from("budgets")
        .select("*")
        .order("updated_at", { ascending: false });

      const list = sortBudgets((budgets ?? []) as Budget[]);
      const budgetIds = list.map((budget) => budget.id);

      if (budgetIds.length === 0) {
        set({
          budgets: [],
          expensesByBudgetId: {},
          memberIdsByBudgetId: {},
          loaded: true,
          loading: false,
        });
        return;
      }

      const [{ data: expenses }, { data: members }] = await Promise.all([
        supabase
          .from("budget_expenses")
          .select("*")
          .in("budget_id", budgetIds)
          .order("expense_date", { ascending: false }),
        supabase
          .from("budget_members")
          .select("budget_id, member_id")
          .in("budget_id", budgetIds),
      ]);

      const expensesGrouped: Record<string, BudgetExpense[]> = {};
      for (const budgetId of budgetIds) {
        expensesGrouped[budgetId] = [];
      }
      for (const expense of mapExpenseAmounts((expenses ?? []) as BudgetExpense[])) {
        if (!expensesGrouped[expense.budget_id]) {
          expensesGrouped[expense.budget_id] = [];
        }
        expensesGrouped[expense.budget_id].push(expense);
      }

      const membersGrouped: Record<string, string[]> = {};
      for (const budgetId of budgetIds) {
        membersGrouped[budgetId] = [];
      }
      for (const row of members ?? []) {
        const budgetId = row.budget_id as string;
        if (!membersGrouped[budgetId]) membersGrouped[budgetId] = [];
        membersGrouped[budgetId].push(row.member_id as string);
      }

      set({
        budgets: list,
        expensesByBudgetId: Object.fromEntries(
          Object.entries(expensesGrouped).map(([id, rows]) => [id, sortExpenses(rows)])
        ),
        memberIdsByBudgetId: membersGrouped,
        loaded: true,
        loading: false,
      });
    });
  },

  fetchWatches: async (force = false) => {
    if (!force && get().watchesLoaded) return;

    return dedupeAsync("budget:watches", async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("budget_watches")
        .select("budget_id");

      set({
        watchedBudgetIds: watchedBudgetIdsFromRows(
          (data ?? []) as { budget_id: string }[]
        ),
        watchesLoaded: true,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
