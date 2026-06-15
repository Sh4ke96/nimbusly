"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteShoppingList } from "@/app/(app)/shopping/actions";
import { ShoppingListWatchButton } from "@/components/shopping/shopping-list-watch-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderActionButton,
  CardHeaderActions,
  CardTitle,
  CARD_TITLE_ROW_CLASSNAME,
} from "@/components/ui/card";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import {
  selectIsListWatched,
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { selectionCardClasses } from "@/lib/ui/selection-styles";
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
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "truncate")}>{list.name}</CardTitle>
        <CardDescription>
          {totalCount === 0
            ? t.shoppingLists.noItemsYet
            : formatMessage(t.shoppingLists.itemsProgress, {
                unchecked: String(uncheckedCount),
                total: String(totalCount),
              })}
        </CardDescription>
        <CardHeaderActions onClick={(e) => e.stopPropagation()}>
          <ShoppingListWatchButton
            listId={list.id}
            compact
            onChanged={onWatchChanged}
            className="border-r border-border [&_button]:size-8 [&_button]:rounded-none [&_button]:border-0 [&_button]:shadow-none"
          />
          <CardHeaderActionButton onClick={onEdit} aria-label={t.shoppingLists.editBtn}>
            <Pencil className="size-4" />
          </CardHeaderActionButton>
          <form action={deleteAction} className="border-l border-border">
            <input type="hidden" name={SHOPPING_FORM_FIELD.ID} value={list.id} />
            <CardHeaderActionButton
              type="submit"
              destructive
              disabled={deletePending}
              aria-label={t.shoppingLists.deleteListBtn}
            >
              <Trash2 className="size-4" />
            </CardHeaderActionButton>
          </form>
        </CardHeaderActions>
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
