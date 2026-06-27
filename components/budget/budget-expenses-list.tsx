"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState } from "react";
import { Trash2, Bell, Repeat } from "lucide-react";
import { deleteBudgetExpense } from "@/app/(app)/budget/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_ENTRY_TYPE,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import { isBudgetEntryRecurring } from "@/lib/budget/recurrence";
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
  const isRecurring = isBudgetEntryRecurring(entry);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBudgetExpense,
    null
  );

  useActionFeedback(deleteState, onChanged);

  return (
    <Card className="rounded-none py-0 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "font-heading text-base font-semibold sm:text-sm",
                  isIncome
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-orange-700 dark:text-orange-400"
                )}
              >
                {isIncome ? "+" : "−"}
                {formatBudgetAmount(Number(entry.amount), lang)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground sm:hidden">
                {entry.expense_date}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs border border-border px-2 py-0.5 text-muted-foreground">
                {typeLabel}
              </span>
              <span className="max-w-full truncate text-xs border border-border px-2 py-0.5 text-muted-foreground">
                {categoryLabel}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {entry.expense_date}
              </span>
              {isRecurring && (
                <span className="inline-flex items-center gap-1 text-xs border border-border px-2 py-0.5 text-muted-foreground">
                  <Repeat className="size-3 shrink-0" />
                  <span className="truncate">{t.budget.recurrenceLabels[entry.recurrence]}</span>
                </span>
              )}
              {!isIncome && entry.payment_reminder_enabled && (
                <span className="inline-flex items-center gap-1 text-xs border border-primary/30 bg-primary/5 px-2 py-0.5 text-primary">
                  <Bell className="size-3 shrink-0" />
                  <span className="truncate">{t.budget.paymentReminderBadge}</span>
                </span>
              )}
            </div>

            {entry.description.trim() && (
              <p className="text-sm text-foreground wrap-break-word">{entry.description}</p>
            )}
            {creator && (
              <p className="text-[11px] text-muted-foreground truncate">
                {t.budget.addedBy}: {creator}
              </p>
            )}
          </div>
          <form action={deleteAction} className="shrink-0">
            <input type="hidden" name={BUDGET_FORM_FIELD.ID} value={entry.id} />
            <input type="hidden" name={BUDGET_FORM_FIELD.BUDGET_ID} value={budgetId} />
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
        </div>
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
            key={`${entry.id}-${entry.expense_date}`}
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
