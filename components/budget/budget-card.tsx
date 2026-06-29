"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBudget } from "@/app/(app)/budget/actions";
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
}

export function BudgetCard({
  budget,
  members,
  selected,
  onSelect,
  onEdit,
  onDeleted,
}: BudgetCardProps) {
  const t = useT();
  const { lang } = useLang();
  const selectExpenses = useMemo(() => selectBudgetExpenses(budget.id), [budget.id]);
  const selectMemberIds = useMemo(() => selectBudgetMemberIds(budget.id), [budget.id]);
  const entries = useBudgetStore(selectExpenses);
  const memberIds = useBudgetStore(selectMemberIds);
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
      <CardContent className="pb-4">
        {budgetMembers.length > 0 ? (
          <div className="flex -space-x-2">
            {budgetMembers.slice(0, 4).map((member) => (
              <MemberAvatar
                key={member.id}
                name={getDisplayName(member)}
                color={member.avatar_color}
                size="sm"
                className="ring-2 ring-background"
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
