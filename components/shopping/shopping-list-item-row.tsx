"use client";

import { useActionState, useMemo } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteShoppingListItem } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import {
  SHOPPING_FORM_FIELD,
  type ShoppingListItem,
} from "@/lib/shopping-lists/types";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { ShoppingListItemChecked } from "@/components/shopping/shopping-list-item-checked";
import { ShoppingListItemQuantity } from "@/components/shopping/shopping-list-item-quantity";
import { ShoppingListItemEditDialog } from "@/components/shopping/shopping-list-item-edit-dialog";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import { cn } from "@/lib/utils";

interface ShoppingListItemRowProps {
  item: ShoppingListItem;
  listId: string;
  categories?: ShoppingListCategory[];
  onChanged?: () => void;
}

export function ShoppingListItemRow({
  item,
  listId,
  categories = [],
  onChanged,
}: ShoppingListItemRowProps) {
  const t = useT();
  const selectItems = useMemo(() => selectShoppingListItems(listId), [listId]);
  const items = useShoppingListsStore(selectItems);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteShoppingListItem,
    null
  );

  useActionFeedback(deleteState, onChanged);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex w-full items-center gap-2 border border-border bg-card px-2 py-2 shadow-sm",
        isDragging && "z-10 opacity-80 ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={t.shoppingLists.dragHandleLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <ShoppingListItemChecked item={item} listId={listId} />

      <p
        className={cn(
          "flex-1 min-w-0 text-sm leading-snug",
          items.find((entry) => entry.id === item.id)?.checked ?? item.checked
            ? "text-muted-foreground line-through"
            : undefined
        )}
      >
        {item.content}
      </p>

      <ShoppingListItemQuantity item={item} listId={listId} />

      <ShoppingListItemEditDialog
        item={item}
        listId={listId}
        categories={categories}
        onSuccess={onChanged}
      />

      <form action={deleteAction}>
        <input type="hidden" name={SHOPPING_FORM_FIELD.ID} value={item.id} />
        <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={deletePending}
          className="cursor-pointer text-muted-foreground hover:text-destructive"
          aria-label={t.shoppingLists.deleteItemBtn}
        >
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}
