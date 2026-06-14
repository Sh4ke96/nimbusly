"use client";

import { useActionState, useMemo, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toggleBudgetWatch } from "@/app/(app)/budget/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { selectIsBudgetWatched, useBudgetStore } from "@/lib/stores/budget-store";
import { cn } from "@/lib/utils";

interface BudgetWatchButtonProps {
  budgetId: string;
  compact?: boolean;
  onChanged?: () => void;
  className?: string;
}

export function BudgetWatchButton({
  budgetId,
  compact = false,
  onChanged,
  className,
}: BudgetWatchButtonProps) {
  const t = useT();
  const selectWatched = useMemo(() => selectIsBudgetWatched(budgetId), [budgetId]);
  const watched = useBudgetStore(selectWatched);
  const [state, action, pending] = useActionState(toggleBudgetWatch, null);

  useActionFeedback(state, onChanged);

  const tooltipText = watched ? t.budget.unwatchHint : t.budget.watchHint;

  return (
    <form action={action} className={className} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="budgetId" value={budgetId} />
      <input type="hidden" name="watch" value={String(!watched)} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            variant={watched ? "secondary" : "outline"}
            size={compact ? "icon" : "default"}
            disabled={pending}
            className={cn("cursor-pointer", !compact && "gap-1.5")}
            aria-pressed={watched}
            aria-label={watched ? t.budget.unwatchBtn : t.budget.watchBtn}
          >
            {watched ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            {!compact && (watched ? t.budget.watchingLabel : t.budget.watchBtn)}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </form>
  );
}
