"use client";

import { useActionState, useState } from "react";
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

function ShoppingListEditForm({
  list,
  onSuccess,
  onClose,
}: {
  list: ShoppingList;
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(() => list.name);
  const [state, action, pending] = useActionState(updateShoppingList, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess?.();
  });

  return (
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
  );
}

export function ShoppingListEditDialog({
  list,
  open,
  onOpenChange,
  onSuccess,
}: ShoppingListEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.shoppingLists.editTitle}</DialogTitle>
        </DialogHeader>
        {list && (
          <ShoppingListEditForm
            key={list.id}
            list={list}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
