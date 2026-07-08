"use client";

import { ArrowLeft } from "lucide-react";
import { ShoppingListItemsPanel } from "@/components/shopping/shopping-list-items-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/lib/lang-context";
import type { ShoppingList } from "@/lib/shopping-lists/types";

type ShoppingListMobileSheetProps = {
  list: ShoppingList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
};

export function ShoppingListMobileSheet({
  list,
  open,
  onOpenChange,
  onChanged,
}: ShoppingListMobileSheetProps) {
  const t = useT();

  if (!list) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-full w-full max-w-full gap-0 rounded-none p-0"
      >
        <SheetHeader className="flex flex-row items-center gap-2 border-b border-border px-3 py-3 pr-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 cursor-pointer"
            onClick={() => onOpenChange(false)}
            aria-label={t.account.back}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate font-heading text-lg">{list.name}</SheetTitle>
            <SheetDescription className="sr-only">
              {t.shoppingLists.mobileListDetailDesc}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ShoppingListItemsPanel
            listId={list.id}
            onChanged={onChanged}
            addItemMode="dialog"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
