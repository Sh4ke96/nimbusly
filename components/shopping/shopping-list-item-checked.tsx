"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { toggleShoppingListItemChecked } from "@/app/(app)/shopping/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { SHOPPING_ITEM_QUANTITY_SYNC_DEBOUNCE_MS } from "@/lib/constants/shopping-lists";
import {
  clearPendingItemChecked,
  setPendingItemChecked,
} from "@/lib/shopping-lists/pending-item-checked";
import {
  SHOPPING_FORM_FIELD,
  type ShoppingListItem,
} from "@/lib/shopping-lists/types";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { useT } from "@/lib/lang-context";

interface ShoppingListItemCheckedProps {
  item: ShoppingListItem;
  listId: string;
}

export function ShoppingListItemChecked({ item, listId }: ShoppingListItemCheckedProps) {
  const t = useT();
  const itemId = item.id;
  const selectItems = selectShoppingListItems(listId);
  const items = useShoppingListsStore(selectItems);
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);
  const fetchItems = useShoppingListsStore((s) => s.fetchItems);

  const liveItem = items.find((entry) => entry.id === itemId) ?? item;
  const checked = liveItem.checked;

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
      clearPendingItemChecked(itemId);
    };
  }, [itemId]);

  function getCurrentChecked(): boolean {
    const listItems = useShoppingListsStore.getState().itemsByListId[listId] ?? [];
    return listItems.find((entry) => entry.id === itemId)?.checked ?? checked;
  }

  function applyOptimisticChecked(nextChecked: boolean) {
    const currentItems =
      useShoppingListsStore.getState().itemsByListId[listId] ?? items;
    setItemsForList(
      listId,
      currentItems.map((entry) =>
        entry.id === itemId ? { ...entry, checked: nextChecked } : entry
      )
    );
    setPendingItemChecked(itemId, nextChecked);
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

    const targetChecked = getCurrentChecked();
    setPendingItemChecked(itemId, targetChecked);

    syncRef.current.inFlight = true;
    syncRef.current.pendingFlush = false;

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.ID, itemId);
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.CHECKED, String(targetChecked));

    const result = await toggleShoppingListItemChecked(null, formData);

    syncRef.current.inFlight = false;

    if (result && "error" in result) {
      clearPendingItemChecked(itemId);
      void fetchItems(listId, true);
      toast.error(result.error);
      if (syncRef.current.pendingFlush) {
        syncRef.current.pendingFlush = false;
        scheduleSync();
      }
      return;
    }

    const latestChecked = getCurrentChecked();
    if (latestChecked !== targetChecked) {
      scheduleSync();
      return;
    }

    clearPendingItemChecked(itemId);

    if (syncRef.current.pendingFlush) {
      syncRef.current.pendingFlush = false;
      void flushSync();
    }
  }

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => applyOptimisticChecked(value === true)}
      className="cursor-pointer"
      aria-label={t.shoppingLists.toggleItemLabel}
    />
  );
}
