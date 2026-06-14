"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ShoppingListAddItem } from "@/components/shopping/shopping-list-add-item";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";

const ShoppingListItemsSortable = dynamic(
  () =>
    import("@/components/shopping/shopping-list-items-sortable").then(
      (m) => m.ShoppingListItemsSortable
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
    ),
  }
);

interface ShoppingListItemsPanelProps {
  listId: string;
  onChanged?: () => void;
}

export function ShoppingListItemsPanel({
  listId,
  onChanged,
}: ShoppingListItemsPanelProps) {
  const t = useT();
  const selectItems = useMemo(() => selectShoppingListItems(listId), [listId]);
  const items = useShoppingListsStore(selectItems);
  const itemsLoading = useShoppingListsStore(
    (s) => s.itemsLoadingByListId[listId] ?? false
  );
  const itemsError = useShoppingListsStore(
    (s) => s.itemsErrorByListId[listId] ?? false
  );
  const fetchItems = useShoppingListsStore((s) => s.fetchItems);

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  if (itemsError) {
    return (
      <ModuleFetchError onRetry={() => void fetchItems(listId, true)} />
    );
  }

  if (itemsLoading && items.length === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ShoppingListAddItem listId={listId} onSuccess={onChanged} />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border">
          {t.shoppingLists.emptyItems}
        </p>
      ) : (
        <ShoppingListItemsSortable
          listId={listId}
          items={items}
          itemIds={itemIds}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
