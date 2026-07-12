"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { QuickAddPanel } from "@/components/app/quick-add-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuickAddEnabled } from "@/lib/hooks/use-quick-add-enabled";
import { prefetchSearchListStores } from "@/lib/search/prefetch-search-stores";
import { useT } from "@/lib/lang-context";

export function QuickAddFab() {
  const t = useT();
  const pathname = usePathname();
  const quickAddEnabled = useQuickAddEnabled();
  const [open, setOpen] = useState<boolean>(false);

  if (pathname === "/onboarding" || pathname === "/calendar" || !quickAddEnabled) {
    return null;
  }

  function handleOpen() {
    setOpen(true);
    void prefetchSearchListStores();
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-4 z-40 size-12 rounded-none shadow-lg md:hidden bottom-[calc(var(--app-mobile-bottom-inset)+0.75rem)]"
        onClick={handleOpen}
        aria-label={t.search.quickAddFabLabel}
      >
        <Plus className="size-6" aria-hidden />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          mobileClearNav
          className="rounded-none gap-0 p-0 min-h-[min(92dvh,calc(100dvh-var(--app-mobile-nav-offset)-0.75rem))] max-h-[min(92dvh,calc(100dvh-var(--app-mobile-nav-offset)-0.75rem))] overflow-hidden"
        >
          <SheetHeader className="border-b border-border px-4 py-3 pr-12">
            <SheetTitle className="font-heading text-left">{t.search.quickAddHeading}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[var(--app-mobile-bottom-inset)]">
            <QuickAddPanel hideHeading onSuccess={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
