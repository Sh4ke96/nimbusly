"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ShoppingListAddItem } from "@/components/shopping/shopping-list-add-item";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";

const ShoppingListCategorizedItems = dynamic(
  () =>
    import("@/components/shopping/shopping-list-categorized-items").then(
      (m) => m.ShoppingListCategorizedItems
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-16 w-full rounded-none" />
      </div>
    ),
  }
);

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
  const categories = useShoppingCategoriesStore((s) => s.categories);
  const categoriesLoaded = useShoppingCategoriesStore((s) => s.loaded);
  const fetchCategories = useShoppingCategoriesStore((s) => s.fetchCategories);
  const itemsLoading = useShoppingListsStore(
    (s) => s.itemsLoadingByListId[listId] ?? false
  );
  const itemsError = useShoppingListsStore(
    (s) => s.itemsErrorByListId[listId] ?? false
  );
  const fetchItems = useShoppingListsStore((s) => s.fetchItems);

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const useCategories = categories.length > 0;

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

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
    <div className="w-full min-w-0 space-y-4">
      <div data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_ADD_ITEM}>
        <ShoppingListAddItem
          listId={listId}
          categories={useCategories ? categories : []}
          onSuccess={onChanged}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border bg-card shadow-sm">
          {t.shoppingLists.emptyItems}
        </p>
      ) : (
        <>
          <NimbusTourToolbarAnchor
            tourTarget={NIMBUS_TOUR_TARGET.SHOPPING_CATEGORIES}
            visible={useCategories && categoriesLoaded}
            className="flex w-full min-w-0 flex-col"
          >
            {useCategories && categoriesLoaded ? (
              <ShoppingListCategorizedItems
                listId={listId}
                items={items}
                categories={categories}
                onChanged={onChanged}
              />
            ) : null}
          </NimbusTourToolbarAnchor>
          {!(useCategories && categoriesLoaded) ? (
            <ShoppingListItemsSortable
              listId={listId}
              items={items}
              itemIds={itemIds}
              onChanged={onChanged}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
