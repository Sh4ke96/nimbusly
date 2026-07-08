"use client";

import { useState } from "react";
import { ListChecks, ListX } from "lucide-react";
import { toast } from "sonner";
import { setAllShoppingListItemsChecked } from "@/app/(app)/shopping/actions";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { SHOPPING_FORM_FIELD, type ShoppingListItem } from "@/lib/shopping-lists/types";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { cn } from "@/lib/utils";

type ShoppingListToggleAllProps = {
  listId: string;
  items: ShoppingListItem[];
  onChanged?: () => void;
  className?: string;
};

export function ShoppingListToggleAll({
  listId,
  items,
  onChanged,
  className,
}: ShoppingListToggleAllProps) {
  const t = useT();
  const setItemsForList = useShoppingListsStore((s) => s.setItemsForList);
  const [pending, setPending] = useState<boolean>(false);

  const allChecked = items.length > 0 && items.every((item) => item.checked);
  const nextChecked = !allChecked;

  async function handleToggleAll() {
    if (pending || items.length === 0) return;

    const previous = items;
    setPending(true);
    setItemsForList(
      listId,
      items.map((item) => ({ ...item, checked: nextChecked }))
    );

    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.LIST_ID, listId);
    formData.set(SHOPPING_FORM_FIELD.CHECKED, String(nextChecked));

    const result = await setAllShoppingListItemsChecked(null, formData);
    setPending(false);

    if (result && "error" in result) {
      setItemsForList(listId, previous);
      toast.error(result.error);
      return;
    }

    onChanged?.();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => void handleToggleAll()}
      className={cn("cursor-pointer rounded-none", className)}
      aria-label={allChecked ? t.shoppingLists.uncheckAllBtn : t.shoppingLists.checkAllBtn}
    >
      {allChecked ? (
        <ListX className="size-4 shrink-0" />
      ) : (
        <ListChecks className="size-4 shrink-0" />
      )}
      {allChecked ? t.shoppingLists.uncheckAllBtn : t.shoppingLists.checkAllBtn}
    </Button>
  );
}
