"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBudget } from "@/app/(app)/budget/actions";
import { BudgetWatchButton } from "@/components/budget/budget-watch-button";
import { MemberAvatar } from "@/components/member-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardHeaderActionButton, CardHeaderActions, CardTitle, CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { formatBudgetAmount, netBalance } from "@/lib/budget/aggregates";
import type { Budget } from "@/lib/budget/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember } from "@/lib/profile";
import {
  selectBudgetExpenses,
  selectBudgetMemberIds,
  selectIsBudgetWatched,
  useBudgetStore,
} from "@/lib/stores/budget-store";
import { selectionCardClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  members: FamilyMember[];
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDeleted?: () => void;
  onWatchChanged?: () => void;
}

export function BudgetCard({
  budget,
  members,
  selected,
  onSelect,
  onEdit,
  onDeleted,
  onWatchChanged,
}: BudgetCardProps) {
  const t = useT();
  const { lang } = useLang();
  const selectExpenses = useMemo(() => selectBudgetExpenses(budget.id), [budget.id]);
  const selectMemberIds = useMemo(() => selectBudgetMemberIds(budget.id), [budget.id]);
  const selectWatched = useMemo(() => selectIsBudgetWatched(budget.id), [budget.id]);
  const entries = useBudgetStore(selectExpenses);
  const memberIds = useBudgetStore(selectMemberIds);
  const watched = useBudgetStore(selectWatched);
  const balance = netBalance(entries);

  const budgetMembers = memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is FamilyMember => !!m);

  const [deleteState, deleteAction, deletePending] = useActionState(deleteBudget, null);
  useActionFeedback(deleteState, onDeleted);

  return (
    <Card
      className={cn(
        "rounded-none py-0 shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md",
        selectionCardClasses(selected)
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader>
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "truncate")}>{budget.name}</CardTitle>
        <CardDescription>
          {budget.is_hidden && (
            <span className="text-muted-foreground/80">{t.budget.hiddenBadge} · </span>
          )}
          {t.budget.entryCount.replace("{count}", String(entries.length))}
          {" · "}
          {formatBudgetAmount(balance, lang)}
        </CardDescription>
        <CardHeaderActions onClick={(e) => e.stopPropagation()}>
          <BudgetWatchButton
            budgetId={budget.id}
            compact
            onChanged={onWatchChanged}
            className="border-r border-border [&_button]:size-8 [&_button]:rounded-none [&_button]:border-0 [&_button]:shadow-none"
          />
          <CardHeaderActionButton onClick={onEdit} aria-label={t.budget.editBtn}>
            <Pencil className="size-4" />
          </CardHeaderActionButton>
          <form action={deleteAction} className="border-l border-border">
            <input type="hidden" name={BUDGET_FORM_FIELD.ID} value={budget.id} />
            <CardHeaderActionButton
              type="submit"
              destructive
              disabled={deletePending}
              aria-label={t.budget.deleteBtn}
            >
              <Trash2 className="size-4" />
            </CardHeaderActionButton>
          </form>
        </CardHeaderActions>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {watched && (
          <p className="text-[11px] font-medium text-primary">{t.budget.watchingBadge}</p>
        )}
        {budgetMembers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">{t.budget.membersShort}:</span>
            {budgetMembers.map((member) => (
              <span key={member.id} className="inline-flex items-center gap-1 text-[11px]">
                <MemberAvatar
                  name={getDisplayName(member)}
                  color={member.avatar_color}
                  size="sm"
                />
                {getDisplayName(member)}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
