"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ShoppingListAddItem } from "@/components/shopping/shopping-list-add-item";
import { ShoppingListAddItemDialog } from "@/components/shopping/shopping-list-add-item-dialog";
import { ShoppingListToggleAll } from "@/components/shopping/shopping-list-toggle-all";
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
import {
  APP_MOBILE_BOTTOM_BAR_CLASS,
  APP_MOBILE_SHOPPING_FOOTER_CLASS,
} from "@/lib/ui/app-layout";
import { cn } from "@/lib/utils";

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
  addItemMode?: "inline" | "dialog";
}

export function ShoppingListItemsPanel({
  listId,
  onChanged,
  addItemMode = "inline",
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
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <div
        className={cn(
          "min-h-0 flex-1 space-y-4 overflow-y-auto",
          addItemMode === "dialog" && "p-4"
        )}
      >
        {addItemMode === "inline" ? (
          <div data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_ADD_ITEM}>
            <ShoppingListAddItem
              listId={listId}
              categories={useCategories ? categories : []}
              onSuccess={onChanged}
            />
          </div>
        ) : null}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border bg-card shadow-sm">
            {t.shoppingLists.emptyItems}
          </p>
        ) : (
          <>
            <div className="flex justify-end">
              <ShoppingListToggleAll
                listId={listId}
                items={items}
                onChanged={onChanged}
              />
            </div>

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
                categories={categories}
                onChanged={onChanged}
              />
            ) : null}
          </>
        )}
      </div>

      {addItemMode === "dialog" ? (
        <div
          className={cn(
            APP_MOBILE_BOTTOM_BAR_CLASS,
            APP_MOBILE_SHOPPING_FOOTER_CLASS,
            "mt-auto shrink-0 border-t border-border bg-background px-2 pt-2"
          )}
          data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_ADD_ITEM}
        >
          <ShoppingListAddItemDialog
            listId={listId}
            categories={useCategories ? categories : []}
            onSuccess={onChanged}
          />
        </div>
      ) : null}
    </div>
  );
}
