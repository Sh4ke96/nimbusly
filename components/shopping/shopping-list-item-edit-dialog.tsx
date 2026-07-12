"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useCallback, useState } from "react";
import { Pencil } from "lucide-react";
import { updateShoppingListItem } from "@/app/(app)/shopping/actions";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { SHOPPING_LIST_ITEM_MAX_LENGTH } from "@/lib/constants/shopping-lists";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import type { ShoppingListItem } from "@/lib/shopping-lists/types";

interface ShoppingListItemEditDialogProps {
  item: ShoppingListItem;
  listId: string;
  categories?: ShoppingListCategory[];
  onSuccess?: () => void;
}

function ShoppingListItemEditForm({
  item,
  listId,
  categories = [],
  onSuccess,
  onClose,
}: ShoppingListItemEditDialogProps & { onClose: () => void }) {
  const t = useT();
  const [content, setContent] = useState<string>(() => item.content);
  const [categoryId, setCategoryId] = useState<string>(() => item.category_id ?? "");

  const submitItem = useCallback(
    (prev: AccountActionState, formData: FormData) => {
      if (categoryId) {
        formData.set(SHOPPING_FORM_FIELD.CATEGORY_ID, categoryId);
      } else {
        formData.set(SHOPPING_FORM_FIELD.CATEGORY_ID, "");
      }
      return updateShoppingListItem(prev, formData);
    },
    [categoryId]
  );

  const [state, action, pending] = useActionState(submitItem, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess?.();
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name={SHOPPING_FORM_FIELD.ID} value={item.id} />
      <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />

      {categories.length > 0 ? (
        <div className="space-y-2">
          <Label>{t.shoppingLists.categorySelectPlaceholder}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={categoryId === "" ? "default" : "outline"}
              className="h-auto min-h-10 cursor-pointer whitespace-normal rounded-none px-3 py-2 text-left text-sm"
              onClick={() => setCategoryId("")}
              disabled={pending}
            >
              {t.shoppingLists.uncategorizedLabel}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant={categoryId === category.id ? "default" : "outline"}
                className="h-auto min-h-10 cursor-pointer whitespace-normal rounded-none px-3 py-2 text-left text-sm"
                onClick={() => setCategoryId(category.id)}
                disabled={pending}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`shopping-edit-item-${item.id}`}>{t.shoppingLists.itemLabel}</Label>
        <Input
          id={`shopping-edit-item-${item.id}`}
          name={SHOPPING_FORM_FIELD.CONTENT}
          required
          maxLength={SHOPPING_LIST_ITEM_MAX_LENGTH}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.shoppingLists.itemPlaceholder}
          className="rounded-none"
          disabled={pending}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full cursor-pointer">
        {pending ? t.shoppingLists.saving : t.shoppingLists.saveItemBtn}
      </Button>
    </form>
  );
}

export function ShoppingListItemEditDialog({
  item,
  listId,
  categories = [],
  onSuccess,
}: ShoppingListItemEditDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label={t.shoppingLists.editItemBtn}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.shoppingLists.editItemDialogTitle}</DialogTitle>
        </DialogHeader>
        <ShoppingListItemEditForm
          key={`${item.id}-${open}`}
          item={item}
          listId={listId}
          categories={categories}
          onSuccess={onSuccess}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
