"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteShoppingList } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import { ShoppingListWatchButton } from "@/components/shopping/shopping-list-watch-button";
import {
  selectIsListWatched,
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { cn } from "@/lib/utils";

interface ShoppingListCardProps {
  list: ShoppingList;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDeleted?: () => void;
  onWatchChanged?: () => void;
}

export function ShoppingListCard({
  list,
  selected,
  onSelect,
  onEdit,
  onDeleted,
  onWatchChanged,
}: ShoppingListCardProps) {
  const t = useT();
  const selectItems = useMemo(() => selectShoppingListItems(list.id), [list.id]);
  const selectWatched = useMemo(() => selectIsListWatched(list.id), [list.id]);
  const items = useShoppingListsStore(selectItems);
  const watched = useShoppingListsStore(selectWatched);
  const uncheckedCount = items.filter((item) => !item.checked).length;
  const totalCount = items.length;

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteShoppingList,
    null
  );

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
            <CardTitle className="font-heading text-base truncate">{list.name}</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalCount === 0
                ? t.shoppingLists.noItemsYet
                : formatMessage(t.shoppingLists.itemsProgress, {
                    unchecked: String(uncheckedCount),
                    total: String(totalCount),
                  })}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
            <ShoppingListWatchButton
              listId={list.id}
              compact
              onChanged={onWatchChanged}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              aria-label={t.shoppingLists.editBtn}
            >
              <Pencil className="size-4" />
            </Button>
            <form action={deleteAction}>
              <input type="hidden" name={SHOPPING_FORM_FIELD.ID} value={list.id} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={deletePending}
                className="cursor-pointer text-destructive hover:text-destructive"
                aria-label={t.shoppingLists.deleteListBtn}
              >
                <Trash2 className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {watched && (
          <p className="text-[11px] font-medium text-primary">
            {t.shoppingLists.watchingBadge}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t.shoppingLists.updatedAt}:{" "}
          {new Date(list.updated_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
