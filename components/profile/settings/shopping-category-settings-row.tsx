"use client";

import { useActionState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  deleteShoppingListCategory,
  updateShoppingListCategory,
} from "@/app/(app)/account/shopping-category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SHOPPING_CATEGORY_NAME_MAX_LENGTH } from "@/lib/constants/shopping-categories";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import {
  SHOPPING_CATEGORY_FORM_FIELD,
  type ShoppingListCategory,
} from "@/lib/shopping-lists/categories";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface ShoppingCategorySettingsRowProps {
  category: ShoppingListCategory;
  onChanged: () => void;
}

export function ShoppingCategorySettingsRow({
  category,
  onChanged,
}: ShoppingCategorySettingsRowProps) {
  const t = useT();
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteShoppingListCategory,
    null
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateShoppingListCategory,
    null
  );

  useActionFeedback(deleteState, onChanged);
  useActionFeedback(updateState, onChanged);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-3 border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-end",
        isDragging && "z-10 opacity-90 shadow-md ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none self-start text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={t.shoppingCategories.dragHandleLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <form action={updateAction} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name={SHOPPING_CATEGORY_FORM_FIELD.ID} value={category.id} />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`category-name-${category.id}`}>{t.shoppingCategories.nameLabel}</Label>
          <Input
            id={`category-name-${category.id}`}
            name={SHOPPING_CATEGORY_FORM_FIELD.NAME}
            defaultValue={category.name}
            maxLength={SHOPPING_CATEGORY_NAME_MAX_LENGTH}
            required
          />
        </div>
        <Button type="submit" variant="outline" disabled={updatePending} className="cursor-pointer shrink-0">
          <Pencil className="size-4" />
          {updatePending ? t.shoppingCategories.saving : t.shoppingCategories.saveBtn}
        </Button>
      </form>

      <form action={deleteAction}>
        <input type="hidden" name={SHOPPING_CATEGORY_FORM_FIELD.ID} value={category.id} />
        <Button
          type="submit"
          variant="ghost"
          disabled={deletePending}
          className="cursor-pointer text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
          {t.shoppingCategories.deleteBtn}
        </Button>
      </form>
    </div>
  );
}
