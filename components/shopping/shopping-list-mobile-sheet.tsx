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
import {
  APP_MOBILE_SHEET_CLEAR_NAV_CLASS,
  APP_MOBILE_SHOPPING_SHEET_HEADER_CLASS,
} from "@/lib/ui/app-layout";
import { cn } from "@/lib/utils";

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
        mobileClearNav
        showCloseButton={false}
        overlayClassName="top-0 bottom-(--app-mobile-nav-offset)"
        className={cn(
          APP_MOBILE_SHEET_CLEAR_NAV_CLASS,
          "flex w-full max-w-full flex-col gap-0 rounded-none border-l p-0"
        )}
      >
        <SheetHeader
          className={cn(
            APP_MOBILE_SHOPPING_SHEET_HEADER_CLASS,
            "flex flex-row items-center gap-2 border-b border-border px-3 pr-4"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 cursor-pointer"
            onClick={() => onOpenChange(false)}
            aria-label={t.onboarding.back}
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
