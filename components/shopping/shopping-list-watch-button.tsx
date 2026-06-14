"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useMemo } from "react";
import { Bell, BellOff } from "lucide-react";
import { toggleShoppingListWatch } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import {
  selectIsListWatched,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { cn } from "@/lib/utils";

interface ShoppingListWatchButtonProps {
  listId: string;
  compact?: boolean;
  onChanged?: () => void;
  className?: string;
}

export function ShoppingListWatchButton({
  listId,
  compact = false,
  onChanged,
  className,
}: ShoppingListWatchButtonProps) {
  const t = useT();
  const selectWatched = useMemo(() => selectIsListWatched(listId), [listId]);
  const watched = useShoppingListsStore(selectWatched);
  const [state, action, pending] = useActionState(toggleShoppingListWatch, null);

  useActionFeedback(state, onChanged);

  const tooltipText = watched ? t.shoppingLists.unwatchHint : t.shoppingLists.watchHint;

  return (
    <form action={action} className={className} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />
      <input type="hidden" name={SHOPPING_FORM_FIELD.WATCH} value={String(!watched)} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            variant={watched ? "secondary" : "outline"}
            size={compact ? "icon" : "sm"}
            disabled={pending}
            className={cn("cursor-pointer", !compact && "gap-1.5")}
            aria-pressed={watched}
            aria-label={watched ? t.shoppingLists.unwatchBtn : t.shoppingLists.watchBtn}
          >
            {watched ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            {!compact && (watched ? t.shoppingLists.watchingLabel : t.shoppingLists.watchBtn)}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </form>
  );
}
