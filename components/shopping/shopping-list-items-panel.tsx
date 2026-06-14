"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { reorderShoppingListItems } from "@/app/(app)/shopping/actions";
import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { ShoppingListAddItem } from "@/components/shopping/shopping-list-add-item";
import { ShoppingListItemRow } from "@/components/shopping/shopping-list-item-row";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { applyItemOrder } from "@/lib/shopping-lists/types";
import { useT } from "@/lib/lang-context";
import {
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";

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
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const nextIds = arrayMove(itemIds, oldIndex, newIndex);
    const previous = items;
    setItemsForList(listId, applyItemOrder(items, nextIds));

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.ORDERED_IDS, JSON.stringify(nextIds));

    const result = await reorderShoppingListItems(null, formData);
    if (result && "error" in result) {
      setItemsForList(listId, previous);
      toast.error(result.error);
    }
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  listId={listId}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
