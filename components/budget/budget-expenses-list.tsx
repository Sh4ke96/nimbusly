"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteBudgetExpense } from "@/app/(app)/budget/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_ENTRY_TYPE,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import { formatBudgetAmount } from "@/lib/budget/aggregates";
import type { BudgetExpense } from "@/lib/budget/types";
import { isIncomeEntry } from "@/lib/budget/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface BudgetExpensesListProps {
  budgetId: string;
  entries: BudgetExpense[];
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onChanged?: () => void;
}

function resolveCreatorName(
  createdBy: string,
  userId: string | undefined,
  profile: Profile | null,
  members: FamilyMember[]
): string | null {
  if (!userId) return null;
  if (createdBy === userId && profile) return getDisplayName(profile);
  const member = members.find((m) => m.id === createdBy);
  return member ? getDisplayName(member) : null;
}

function EntryRow({
  entry,
  budgetId,
  categoryLabel,
  typeLabel,
  creator,
  onChanged,
}: {
  entry: BudgetExpense;
  budgetId: string;
  categoryLabel: string;
  typeLabel: string;
  creator: string | null;
  onChanged?: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const isIncome = isIncomeEntry(entry);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBudgetExpense,
    null
  );

  useActionFeedback(deleteState, onChanged);

  return (
    <Card className="rounded-none py-0 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "font-heading font-semibold text-sm",
                isIncome
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-orange-700 dark:text-orange-400"
              )}
            >
              {isIncome ? "+" : "−"}
              {formatBudgetAmount(Number(entry.amount), lang)}
            </span>
            <span className="text-xs border border-border px-2 py-0.5 text-muted-foreground">
              {typeLabel}
            </span>
            <span className="text-xs border border-border px-2 py-0.5 text-muted-foreground">
              {categoryLabel}
            </span>
            <span className="text-xs text-muted-foreground">{entry.expense_date}</span>
          </div>
          {entry.description.trim() && (
            <p className="text-sm text-foreground">{entry.description}</p>
          )}
          {creator && (
            <p className="text-[11px] text-muted-foreground">
              {t.budget.addedBy}: {creator}
            </p>
          )}
        </div>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="budgetId" value={budgetId} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={deletePending}
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            aria-label={
              isIncome ? t.budget.deleteIncomeBtn : t.budget.deleteExpenseBtn
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function BudgetExpensesList({
  budgetId,
  entries,
  profile,
  members,
  userId,
  onChanged,
}: BudgetExpensesListProps) {
  const t = useT();

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border">
        {t.budget.emptyEntries}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isIncome = isIncomeEntry(entry);
        const categoryLabel = isIncome
          ? t.budget.incomeCategoryLabels[entry.category as BudgetIncomeCategory]
          : t.budget.categoryLabels[entry.category as BudgetExpenseCategory];
        const typeLabel =
          entry.entry_type === BUDGET_ENTRY_TYPE.INCOME
            ? t.budget.filterIncome
            : t.budget.filterExpenses;

        return (
          <EntryRow
            key={entry.id}
            entry={entry}
            budgetId={budgetId}
            categoryLabel={categoryLabel}
            typeLabel={typeLabel}
            creator={resolveCreatorName(entry.created_by, userId, profile, members)}
            onChanged={onChanged}
          />
        );
      })}
    </div>
  );
}
