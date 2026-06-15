"use client";

import { useState, type ReactNode } from "react";
import { ListFilter } from "lucide-react";

import { FilterSheetProvider } from "@/components/filters/filter-sheet-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  title: string;
  description?: string;
  activeCount: number;
  onClear?: () => void;
  clearDisabled?: boolean;
  triggerLabel?: string;
  showTriggerLabel?: boolean;
  children: ReactNode;
  className?: string;
}

export function FilterSheet({
  title,
  description,
  activeCount,
  onClear,
  clearDisabled = false,
  triggerLabel,
  showTriggerLabel = true,
  children,
  className,
}: FilterSheetProps) {
  const t = useT();
  const label = triggerLabel ?? t.common.filters;
  const [open, setOpen] = useState<boolean>(false);

  function handleClear() {
    onClear?.();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("relative shrink-0 rounded-none", className)}
          aria-label={label}
        >
          <ListFilter className="size-4" />
          {showTriggerLabel ? label : null}
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <FilterSheetProvider close={() => setOpen(false)}>{children}</FilterSheetProvider>
        </div>
        {onClear ? (
          <SheetFooter className="px-4 pb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-none"
              onClick={handleClear}
              disabled={clearDisabled || activeCount === 0}
            >
              {t.common.clearFilters}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
