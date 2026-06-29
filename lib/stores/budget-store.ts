import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { BUDGET_ENTRY_TYPE, BUDGET_RECURRENCE } from "@/lib/constants/budget";
import type { Budget, BudgetExpense } from "@/lib/budget/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";
import { compareNamesByProfileLang } from "@/lib/stores/sort-lang";

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

interface BudgetStore {
  budgets: Budget[];
  expensesByBudgetId: Record<string, BudgetExpense[]>;
  memberIdsByBudgetId: Record<string, string[]>;
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchBudgets: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  budgets: [] as Budget[],
  expensesByBudgetId: {} as Record<string, BudgetExpense[]>,
  memberIdsByBudgetId: {} as Record<string, string[]>,
  ...listFetchInitial,
};

function sortBudgets(budgets: Budget[]): Budget[] {
  return [...budgets].sort((a, b) => compareNamesByProfileLang(a.name, b.name));
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

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  ...initialState,

  fetchBudgets: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("budget:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();

          const { data: budgets, error: budgetsError } = await supabase
            .from("budgets")
            .select("*")
            .order("updated_at", { ascending: false });

          if (budgetsError) return { data: null, error: budgetsError };

          const list = sortBudgets(mapBudgets((budgets ?? []) as Budget[]));
          const budgetIds = list.map((budget) => budget.id);

          if (budgetIds.length === 0) {
            return {
              data: {
                budgets: [] as Budget[],
                expensesByBudgetId: {} as Record<string, BudgetExpense[]>,
                memberIdsByBudgetId: {} as Record<string, string[]>,
              },
              error: null,
            };
          }

          const [{ data: expenses, error: expensesError }, { data: members, error: membersError }] =
            await Promise.all([
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

          if (expensesError) return { data: null, error: expensesError };
          if (membersError) return { data: null, error: membersError };

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

          return {
            data: {
              budgets: list,
              expensesByBudgetId: Object.fromEntries(
                Object.entries(expensesGrouped).map(([id, rows]) => [id, sortExpenses(rows)])
              ),
              memberIdsByBudgetId: membersGrouped,
            },
            error: null,
          };
        },
        apply: (data) => {
          const payload = data as {
            budgets: Budget[];
            expensesByBudgetId: Record<string, BudgetExpense[]>;
            memberIdsByBudgetId: Record<string, string[]>;
          } | null;
          set({
            budgets: payload?.budgets ?? [],
            expensesByBudgetId: payload?.expensesByBudgetId ?? {},
            memberIdsByBudgetId: payload?.memberIdsByBudgetId ?? {},
          });
        },
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
