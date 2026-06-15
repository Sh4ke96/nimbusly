"use client";

import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createShoppingList } from "@/app/(app)/shopping/actions";
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
import { SHOPPING_LIST_NAME_MAX_LENGTH } from "@/lib/constants/shopping-lists";

interface ShoppingListFormDialogProps {
  onSuccess?: () => void;
}

export function ShoppingListFormDialog({ onSuccess }: ShoppingListFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [state, action, pending] = useActionState(createShoppingList, null);

  useActionFeedback(state, () => {
    setOpen(false);
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer">
          <Plus className="size-4" />
          {t.shoppingLists.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.shoppingLists.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopping-list-name">{t.shoppingLists.nameLabel}</Label>
            <Input
              id="shopping-list-name"
              name={SHOPPING_FORM_FIELD.NAME}
              required
              maxLength={SHOPPING_LIST_NAME_MAX_LENGTH}
              placeholder={t.shoppingLists.namePlaceholder}
              className="rounded-none"
            />
            <p className="text-xs text-muted-foreground">{t.shoppingLists.nameHint}</p>
          </div>
          <Button type="submit" disabled={pending} className="w-full cursor-pointer">
            {pending ? t.shoppingLists.saving : t.shoppingLists.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
