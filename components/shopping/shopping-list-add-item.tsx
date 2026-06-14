"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useRef } from "react";
import { addShoppingListItem } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { SHOPPING_LIST_ITEM_MAX_LENGTH } from "@/lib/constants/shopping-lists";

interface ShoppingListAddItemProps {
  listId: string;
  onSuccess?: () => void;
}

export function ShoppingListAddItem({ listId, onSuccess }: ShoppingListAddItemProps) {
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addShoppingListItem, null);

  useActionFeedback(state, () => {
    formRef.current?.reset();
    onSuccess?.();
  });

  return (
    <form ref={formRef} action={action} className="flex gap-2">
      <input type="hidden" name={SHOPPING_FORM_FIELD.LIST_ID} value={listId} />
      <Input
        name={SHOPPING_FORM_FIELD.CONTENT}
        required
        maxLength={SHOPPING_LIST_ITEM_MAX_LENGTH}
        placeholder={t.shoppingLists.itemPlaceholder}
        className="rounded-none"
        disabled={pending}
      />
      <Button type="submit" disabled={pending} className="shrink-0 cursor-pointer">
        {pending ? t.shoppingLists.saving : t.shoppingLists.addItemBtn}
      </Button>
    </form>
  );
}
