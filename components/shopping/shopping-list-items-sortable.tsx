"use client";

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
import { ShoppingListItemRow } from "@/components/shopping/shopping-list-item-row";
import { applyItemOrder, type ShoppingListItem } from "@/lib/shopping-lists/types";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";

interface ShoppingListItemsSortableProps {
  listId: string;
  items: ShoppingListItem[];
  itemIds: string[];
  categories?: ShoppingListCategory[];
  onChanged?: () => void;
}

export function ShoppingListItemsSortable({
  listId,
  items,
  itemIds,
  categories = [],
  onChanged,
}: ShoppingListItemsSortableProps) {
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex w-full flex-col gap-2">
          {items.map((item) => (
            <ShoppingListItemRow
              key={item.id}
              item={item}
              listId={listId}
              categories={categories}
              onChanged={onChanged}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
