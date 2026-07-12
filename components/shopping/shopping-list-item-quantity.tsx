"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateShoppingListItem } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { SHOPPING_ITEM_QUANTITY_MAX, SHOPPING_ITEM_QUANTITY_MIN } from "@/lib/constants/shopping-categories";
import { SHOPPING_ITEM_QUANTITY_SYNC_DEBOUNCE_MS } from "@/lib/constants/shopping-lists";
import { useT } from "@/lib/lang-context";
import {
  clearPendingItemQuantity,
  setPendingItemQuantity,
} from "@/lib/shopping-lists/pending-item-quantity";
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
  const itemId = item.id;
  const selectItems = selectShoppingListItems(listId);
  const items = useShoppingListsStore(selectItems);
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);
  const fetchItems = useShoppingListsStore((s) => s.fetchItems);

  const liveItem = items.find((entry) => entry.id === itemId) ?? item;
  const quantity = liveItem.quantity;

  const syncRef = useRef<{
    debounceTimer: ReturnType<typeof setTimeout> | null;
    inFlight: boolean;
    pendingFlush: boolean;
  }>({ debounceTimer: null, inFlight: false, pendingFlush: false });

  useEffect(() => {
    const syncState = syncRef.current;
    return () => {
      if (syncState.debounceTimer) {
        clearTimeout(syncState.debounceTimer);
      }
      clearPendingItemQuantity(itemId);
    };
  }, [itemId]);

  function getCurrentQuantity(): number {
    const listItems = useShoppingListsStore.getState().itemsByListId[listId] ?? [];
    return listItems.find((entry) => entry.id === itemId)?.quantity ?? quantity;
  }

  function applyOptimisticQuantity(nextQuantity: number) {
    const currentItems =
      useShoppingListsStore.getState().itemsByListId[listId] ?? items;
    setItemsForList(
      listId,
      currentItems.map((entry) =>
        entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry
      )
    );
    setPendingItemQuantity(itemId, nextQuantity);
    scheduleSync();
  }

  function scheduleSync() {
    if (syncRef.current.debounceTimer) {
      clearTimeout(syncRef.current.debounceTimer);
    }
    syncRef.current.debounceTimer = setTimeout(() => {
      syncRef.current.debounceTimer = null;
      void flushSync();
    }, SHOPPING_ITEM_QUANTITY_SYNC_DEBOUNCE_MS);
  }

  async function flushSync() {
    if (syncRef.current.inFlight) {
      syncRef.current.pendingFlush = true;
      return;
    }

    const targetQuantity = getCurrentQuantity();
    setPendingItemQuantity(itemId, targetQuantity);

    syncRef.current.inFlight = true;
    syncRef.current.pendingFlush = false;

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.ID, itemId);
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.QUANTITY, String(targetQuantity));

    const result = await updateShoppingListItem(null, formData);

    syncRef.current.inFlight = false;

    if (result && "error" in result) {
      clearPendingItemQuantity(itemId);
      void fetchItems(listId, true);
      toast.error(result.error);
      if (syncRef.current.pendingFlush) {
        syncRef.current.pendingFlush = false;
        scheduleSync();
      }
      return;
    }

    const latestQuantity = getCurrentQuantity();
    if (latestQuantity !== targetQuantity) {
      scheduleSync();
      return;
    }

    clearPendingItemQuantity(itemId);

    if (syncRef.current.pendingFlush) {
      syncRef.current.pendingFlush = false;
      void flushSync();
    }
  }

  function bump(delta: number) {
    const current = getCurrentQuantity();
    const clamped = Math.min(
      SHOPPING_ITEM_QUANTITY_MAX,
      Math.max(SHOPPING_ITEM_QUANTITY_MIN, current + delta)
    );
    if (clamped === current) return;
    applyOptimisticQuantity(clamped);
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7 rounded-none cursor-pointer"
        disabled={quantity <= SHOPPING_ITEM_QUANTITY_MIN}
        aria-label={t.shoppingLists.decreaseQuantityLabel}
        onClick={() => bump(-1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="min-w-7 text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7 rounded-none cursor-pointer"
        disabled={quantity >= SHOPPING_ITEM_QUANTITY_MAX}
        aria-label={t.shoppingLists.increaseQuantityLabel}
        onClick={() => bump(1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
