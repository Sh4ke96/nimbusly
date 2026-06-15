"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
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
import {
  createShoppingListCategory,
  reorderShoppingListCategories,
} from "@/app/(app)/account/shopping-category-actions";
import { ShoppingCategorySettingsRow } from "@/components/profile/settings/shopping-category-settings-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { SHOPPING_CATEGORY_NAME_MAX_LENGTH } from "@/lib/constants/shopping-categories";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { isFamilyFounder } from "@/lib/profile/family-roles";
import {
  applyCategoryOrder,
  SHOPPING_CATEGORY_FORM_FIELD,
} from "@/lib/shopping-lists/categories";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";

export function ShoppingCategoriesSection() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const family = useProfileStore((s) => s.family);
  const categories = useShoppingCategoriesStore((s) => s.categories);
  const loaded = useShoppingCategoriesStore((s) => s.loaded);
  const loading = useShoppingCategoriesStore((s) => s.loading);
  const error = useShoppingCategoriesStore((s) => s.error);
  const fetchCategories = useShoppingCategoriesStore((s) => s.fetchCategories);
  const setCategories = useShoppingCategoriesStore((s) => s.setCategories);

  const formRef = useRef<HTMLFormElement>(null);
  const [createState, createAction, createPending] = useActionState(
    createShoppingListCategory,
    null
  );

  const isFounder = isFamilyFounder(family, user?.id);
  const categoryIds = useMemo(() => categories.map((category) => category.id), [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isFounder) void fetchCategories();
  }, [isFounder, fetchCategories]);

  useActionFeedback(createState, () => {
    formRef.current?.reset();
    void fetchCategories(true);
  });

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryIds.indexOf(String(active.id));
    const newIndex = categoryIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const nextIds = arrayMove(categoryIds, oldIndex, newIndex);
    const previous = categories;
    setCategories(applyCategoryOrder(categories, nextIds));

    const formData = new FormData();
    formData.set(SHOPPING_CATEGORY_FORM_FIELD.ORDERED_IDS, JSON.stringify(nextIds));

    const result = await reorderShoppingListCategories(null, formData);
    if (result && "error" in result) {
      setCategories(previous);
      toast.error(result.error);
    }
  }

  if (!isFounder) {
    return (
      <p className="text-sm text-muted-foreground">{t.shoppingCategories.founderOnlyHint}</p>
    );
  }

  if (error) {
    return <ModuleFetchError onRetry={() => void fetchCategories(true)} />;
  }

  if (!loaded && loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-24 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-muted-foreground">{t.shoppingCategories.desc}</p>

      <form ref={formRef} action={createAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-shopping-category">{t.shoppingCategories.addLabel}</Label>
          <Input
            id="new-shopping-category"
            name={SHOPPING_CATEGORY_FORM_FIELD.NAME}
            placeholder={t.shoppingCategories.namePlaceholder}
            maxLength={SHOPPING_CATEGORY_NAME_MAX_LENGTH}
            required
          />
        </div>
        <Button type="submit" disabled={createPending} className="cursor-pointer shrink-0">
          {createPending ? t.shoppingCategories.saving : t.shoppingCategories.addBtn}
        </Button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed border-border px-4 py-8 text-center">
          {t.shoppingCategories.empty}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {categories.map((category) => (
                <ShoppingCategorySettingsRow
                  key={category.id}
                  category={category}
                  onChanged={() => void fetchCategories(true)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
