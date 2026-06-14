"use client";

import { useActionState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBudget } from "@/app/(app)/budget/actions";
import { BudgetWatchButton } from "@/components/budget/budget-watch-button";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        selected && "ring-2 ring-primary/30 border-primary/40"
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
      <CardHeader className="border-b border-border pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="font-heading text-base truncate">{budget.name}</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">
              {t.budget.entryCount.replace("{count}", String(entries.length))}
              {" · "}
              {formatBudgetAmount(balance, lang)}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
            <BudgetWatchButton
              budgetId={budget.id}
              compact
              onChanged={onWatchChanged}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              aria-label={t.budget.editBtn}
            >
              <Pencil className="size-4" />
            </Button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={budget.id} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={deletePending}
                className="cursor-pointer text-destructive hover:text-destructive"
                aria-label={t.budget.deleteBtn}
              >
                <Trash2 className="size-4" />
              </Button>
            </form>
          </div>
        </div>
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
