"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useCallback, useRef, useState } from "react";
import { addShoppingListItem } from "@/app/(app)/shopping/actions";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { SHOPPING_LIST_ITEM_MAX_LENGTH } from "@/lib/constants/shopping-lists";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";

const UNCATEGORIZED_SELECT_VALUE = "__uncategorized__";

interface ShoppingListAddItemProps {
  listId: string;
  categories?: ShoppingListCategory[];
  onSuccess?: () => void;
}

export function ShoppingListAddItem({
  listId,
  categories = [],
  onSuccess,
}: ShoppingListAddItemProps) {
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
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
    onSuccess?.();
  });

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />
      <input type="hidden" name={SHOPPING_FORM_FIELD.QUANTITY} value="1" />

      {categories.length > 0 ? (
        <Select
          value={categoryId || UNCATEGORIZED_SELECT_VALUE}
          onValueChange={(value) =>
            setCategoryId(value === UNCATEGORIZED_SELECT_VALUE ? "" : value)
          }
          disabled={pending}
        >
          <SelectTrigger
            id={`category-${listId}`}
            className="w-full sm:w-44 shrink-0 bg-card"
            aria-label={t.shoppingLists.categorySelectPlaceholder}
          >
            <SelectValue placeholder={t.shoppingLists.categorySelectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNCATEGORIZED_SELECT_VALUE}>
              {t.shoppingLists.uncategorizedLabel}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Input
        name={SHOPPING_FORM_FIELD.CONTENT}
        required
        maxLength={SHOPPING_LIST_ITEM_MAX_LENGTH}
        placeholder={t.shoppingLists.itemPlaceholder}
        className="h-10 rounded-none flex-1 min-w-0 bg-card shadow-sm"
        disabled={pending}
      />
      <Button type="submit" disabled={pending} className="shrink-0 cursor-pointer">
        {pending ? t.shoppingLists.saving : t.shoppingLists.addItemBtn}
      </Button>
    </form>
  );
}
