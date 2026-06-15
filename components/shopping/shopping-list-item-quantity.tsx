"use client";

import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateShoppingListItem } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { SHOPPING_ITEM_QUANTITY_MAX, SHOPPING_ITEM_QUANTITY_MIN } from "@/lib/constants/shopping-categories";
import { useT } from "@/lib/lang-context";
import {
  SHOPPING_FORM_FIELD,
  type ShoppingListItem,
} from "@/lib/shopping-lists/types";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";

interface ShoppingListItemQuantityProps {
  item: ShoppingListItem;
  listId: string;
}

export function ShoppingListItemQuantity({
  item,
  listId,
}: ShoppingListItemQuantityProps) {
  const t = useT();
  const selectItems = selectShoppingListItems(listId);
  const items = useShoppingListsStore(selectItems);
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);

  async function setQuantity(nextQuantity: number) {
    const clamped = Math.min(
      SHOPPING_ITEM_QUANTITY_MAX,
      Math.max(SHOPPING_ITEM_QUANTITY_MIN, nextQuantity)
    );
    if (clamped === item.quantity) return;

    const previous = items;
    setItemsForList(
      listId,
      items.map((entry) =>
        entry.id === item.id ? { ...entry, quantity: clamped } : entry
      )
    );

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.ID, item.id);
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.QUANTITY, String(clamped));

    const result = await updateShoppingListItem(null, formData);
    if (result && "error" in result) {
      setItemsForList(listId, previous);
      toast.error(result.error);
    }
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7 rounded-none cursor-pointer"
        disabled={item.quantity <= SHOPPING_ITEM_QUANTITY_MIN}
        aria-label={t.shoppingLists.decreaseQuantityLabel}
        onClick={() => void setQuantity(item.quantity - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="min-w-7 text-center text-sm font-medium tabular-nums">
        {item.quantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7 rounded-none cursor-pointer"
        disabled={item.quantity >= SHOPPING_ITEM_QUANTITY_MAX}
        aria-label={t.shoppingLists.increaseQuantityLabel}
        onClick={() => void setQuantity(item.quantity + 1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
