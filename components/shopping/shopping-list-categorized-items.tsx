"use client";

import { useMemo, useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, CircleCheck, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  reorderShoppingListCategories,
  reorderShoppingListItems,
} from "@/app/(app)/shopping/actions";
import { ShoppingListItemRow } from "@/components/shopping/shopping-list-item-row";
import {
  applyCategoryOrder,
  groupShoppingItemsByCategory,
  mergeCategoryItemOrder,
  SHOPPING_CATEGORY_FORM_FIELD,
  type ShoppingCategoryGroup,
  type ShoppingListCategory,
} from "@/lib/shopping-lists/categories";
import { SHOPPING_UNCATEGORIZED_KEY } from "@/lib/constants/shopping-categories";
import { SHOPPING_FORM_FIELD, applyItemOrder, type ShoppingListItem } from "@/lib/shopping-lists/types";
import { useT } from "@/lib/lang-context";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { cn } from "@/lib/utils";

interface ShoppingListCategorizedItemsProps {
  listId: string;
  items: ShoppingListItem[];
  categories: ShoppingListCategory[];
  onChanged?: () => void;
}

function SortableCategorySection({
  group,
  listId,
  expanded,
  onToggle,
  onItemDragEnd,
  onChanged,
}: {
  group: ShoppingCategoryGroup;
  listId: string;
  expanded: boolean;
  onToggle: () => void;
  onItemDragEnd: (categoryKey: string, event: DragEndEvent) => void;
  onChanged?: () => void;
}) {
  const t = useT();
  const isSortableCategory = group.categoryId !== null;
  const sortable = useSortable({
    id: `category-${group.key}`,
    disabled: !isSortableCategory,
  });

  const itemSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(() => group.items.map((item) => item.id), [group.items]);
  const allPurchased =
    group.items.length > 0 && group.items.every((item) => item.checked);

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={isSortableCategory ? sortable.setNodeRef : undefined}
      style={isSortableCategory ? style : undefined}
      className={cn(
        "w-full min-w-0 border border-border bg-card shadow-sm",
        sortable.isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <div className="flex w-full min-w-0 items-center gap-2 border-b border-border px-2 py-2">
        {isSortableCategory ? (
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label={t.shoppingLists.dragCategoryLabel}
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}

        <button
          type="button"
          className="flex flex-1 items-center justify-between gap-2 text-left cursor-pointer"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 font-heading text-sm font-semibold">
            <span className="truncate">{group.name}</span>
            {allPurchased ? (
              <CircleCheck
                className="size-4 shrink-0 text-primary"
                aria-label={t.shoppingLists.categoryAllPurchasedLabel}
              />
            ) : null}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {group.items.length > 0 && (
              <span>
                {t.shoppingLists.categoryItemCount.replace(
                  "{count}",
                  String(group.items.length)
                )}
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                expanded ? "rotate-180" : "rotate-0"
              )}
            />
          </span>
        </button>
      </div>

      {expanded && (
        <div className="w-full p-2">
          {group.items.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-3 text-center">
              {t.shoppingLists.emptyCategory}
            </p>
          ) : (
            <DndContext
              sensors={itemSensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onItemDragEnd(group.key, event)}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <div className="flex w-full flex-col gap-2">
                  {group.items.map((item) => (
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
      )}
    </div>
  );
}

export function ShoppingListCategorizedItems({
  listId,
  items,
  categories,
  onChanged,
}: ShoppingListCategorizedItemsProps) {
  const t = useT();
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);
  const setCategories = useShoppingCategoriesStore((s) => s.setCategories);

  const groups = useMemo(
    () => groupShoppingItemsByCategory(items, categories, t.shoppingLists.uncategorizedLabel),
    [items, categories, t.shoppingLists.uncategorizedLabel]
  );

  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(() => new Set());

  const categorySortableIds = useMemo(
    () =>
      groups
        .filter((group) => group.categoryId !== null)
        .map((group) => `category-${group.key}`),
    [groups]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeKey = String(active.id).replace(/^category-/, "");
    const overKey = String(over.id).replace(/^category-/, "");
    if (activeKey === SHOPPING_UNCATEGORIZED_KEY || overKey === SHOPPING_UNCATEGORIZED_KEY) {
      return;
    }

    const sortableCategories = categories.filter((category) => category.id);
    const oldIndex = sortableCategories.findIndex((category) => category.id === activeKey);
    const newIndex = sortableCategories.findIndex((category) => category.id === overKey);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextCategories = applyCategoryOrder(
      sortableCategories,
      arrayMove(
        sortableCategories.map((category) => category.id),
        oldIndex,
        newIndex
      )
    );

    const previousCategories = categories;
    setCategories(nextCategories);

    const formData = new FormData();
    formData.set(
      SHOPPING_CATEGORY_FORM_FIELD.ORDERED_IDS,
      JSON.stringify(nextCategories.map((category) => category.id))
    );

    const result = await reorderShoppingListCategories(null, formData);
    if (result && "error" in result) {
      setCategories(previousCategories);
      toast.error(result.error);
    }
  }

  async function handleItemDragEnd(categoryKey: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const group = groups.find((entry) => entry.key === categoryKey);
    if (!group) return;

    const itemIds = group.items.map((item) => item.id);
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const nextIdsInCategory = arrayMove(itemIds, oldIndex, newIndex);
    const globalOrder = mergeCategoryItemOrder(groups, categoryKey, nextIdsInCategory);
    const previous = items;
    setItemsForList(listId, applyItemOrder(items, globalOrder));

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.ORDERED_IDS, JSON.stringify(globalOrder));

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
      onDragEnd={(event) => void handleCategoryDragEnd(event)}
    >
      <SortableContext items={categorySortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex w-full min-w-0 flex-col gap-3">
          {groups.map((group) => (
            <SortableCategorySection
              key={group.key}
              group={group}
              listId={listId}
              expanded={!collapsedKeys.has(group.key)}
              onToggle={() =>
                setCollapsedKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(group.key)) next.delete(group.key);
                  else next.add(group.key);
                  return next;
                })
              }
              onItemDragEnd={handleItemDragEnd}
              onChanged={onChanged}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
