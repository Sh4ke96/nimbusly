"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useCallback, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addShoppingListItem } from "@/app/(app)/shopping/actions";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { SHOPPING_LIST_ITEM_MAX_LENGTH } from "@/lib/constants/shopping-lists";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import { cn } from "@/lib/utils";

interface ShoppingListAddItemDialogProps {
  listId: string;
  categories?: ShoppingListCategory[];
  onSuccess?: () => void;
  className?: string;
}

export function ShoppingListAddItemDialog({
  listId,
  categories = [],
  onSuccess,
  className,
}: ShoppingListAddItemDialogProps) {
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string>("");

  const submitItem = useCallback(
    (prev: AccountActionState, formData: FormData) => {
      if (categoryId) {
        formData.set(SHOPPING_FORM_FIELD.CATEGORY_ID, categoryId);
      } else {
        formData.delete(SHOPPING_FORM_FIELD.CATEGORY_ID);
      }
      return addShoppingListItem(prev, formData);
    },
    [categoryId]
  );

  const [state, action, pending] = useActionState(submitItem, null);

  useActionFeedback(state, () => {
    formRef.current?.reset();
    setCategoryId("");
    setOpen(false);
    onSuccess?.();
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCategoryId("");
      formRef.current?.reset();
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-auto w-full cursor-pointer justify-between gap-3 rounded-none px-0 py-1 hover:bg-transparent",
          className
        )}
        onClick={() => setOpen(true)}
        aria-label={t.shoppingLists.addItemFabLabel}
      >
        <span className="text-left text-sm font-medium text-foreground">
          {t.shoppingLists.addItemFabLabel}
        </span>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Plus className="size-5" aria-hidden />
        </span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t.shoppingLists.addItemDialogTitle}</DialogTitle>
          </DialogHeader>

          <form ref={formRef} action={action} className="space-y-4">
            <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />
            <input type="hidden" name={SHOPPING_FORM_FIELD.QUANTITY} value="1" />

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
              <Label htmlFor={`shopping-item-${listId}`}>{t.shoppingLists.itemLabel}</Label>
              <Input
                id={`shopping-item-${listId}`}
                name={SHOPPING_FORM_FIELD.CONTENT}
                required
                maxLength={SHOPPING_LIST_ITEM_MAX_LENGTH}
                placeholder={t.shoppingLists.itemPlaceholder}
                className="rounded-none bg-card shadow-sm"
                disabled={pending}
                autoFocus
              />
            </div>

            <Button type="submit" disabled={pending} className="w-full cursor-pointer">
              {pending ? t.shoppingLists.saving : t.shoppingLists.addItemBtn}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
