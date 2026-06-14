"use client";

import { useActionState, useEffect, useState } from "react";
import { updateShoppingList } from "@/app/(app)/shopping/actions";
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
import { SHOPPING_LIST_NAME_MAX_LENGTH } from "@/lib/constants/shopping-lists";
import type { ShoppingList } from "@/lib/shopping-lists/types";

interface ShoppingListEditDialogProps {
  list: ShoppingList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ShoppingListEditDialog({
  list,
  open,
  onOpenChange,
  onSuccess,
}: ShoppingListEditDialogProps) {
  const t = useT();
  const [name, setName] = useState("");
  const [state, action, pending] = useActionState(updateShoppingList, null);

  useEffect(() => {
    if (list) setName(list.name);
  }, [list]);

  useActionFeedback(state, () => {
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.shoppingLists.editTitle}</DialogTitle>
        </DialogHeader>
        {list && (
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={list.id} />
            <div className="space-y-2">
              <Label htmlFor="shopping-list-edit-name">{t.shoppingLists.nameLabel}</Label>
              <Input
                id="shopping-list-edit-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={SHOPPING_LIST_NAME_MAX_LENGTH}
                className="rounded-none"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full cursor-pointer">
              {pending ? t.shoppingLists.saving : t.shoppingLists.saveBtn}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
