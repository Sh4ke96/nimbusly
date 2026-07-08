"use client";

import { useCallback, useEffect, useState } from "react";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { isSearchFirstUse, markSearchUsed } from "@/lib/nimbus/search-first-use";
import {
  enqueueNimbusMessage,
  NIMBUS_MESSAGE_PRIORITY,
} from "@/lib/nimbus/message-dispatcher";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlobalSearchDialogBody } from "@/components/app/global-search-dialog-body";
import { useIsMac } from "@/lib/hooks/use-is-mac";
import { useT } from "@/lib/lang-context";
import { prefetchSearchListStores } from "@/lib/search/prefetch-search-stores";
import { HEADER_CONTROL_HEIGHT, HEADER_ICON_BUTTON_CLASS } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function GlobalSearchDialog() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [hydrating, setHydrating] = useState<boolean>(false);
  const isMac = useIsMac();

  const handleOpen = useCallback(() => {
    const firstUse = isSearchFirstUse();
    markSearchUsed();
    setOpen(true);
    setHydrating(true);
    void prefetchSearchListStores().finally(() => setHydrating(false));
    if (firstUse) {
      enqueueNimbusMessage({
        priority: NIMBUS_MESSAGE_PRIORITY.context,
        kind: "context",
        message: t.companion.searchFirstUseHint,
      });
    }
  }, [t]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handleOpen();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleOpen]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <div
        className="flex shrink-0 items-center gap-1 sm:inline-flex"
        data-nimbus-tour={NIMBUS_TOUR_TARGET.GLOBAL_SEARCH_TRIGGER}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            HEADER_CONTROL_HEIGHT,
            "hidden sm:inline-flex w-52 justify-between gap-2 rounded-none border-border bg-muted/40 px-2.5 text-muted-foreground font-normal"
          )}
          onClick={handleOpen}
          aria-label={t.search.triggerLabel}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Search className="size-4 shrink-0" />
            <span className="truncate">{t.search.triggerLabel}</span>
          </span>
          <KbdGroup className="shrink-0" aria-hidden>
            {isMac ? <Kbd>⌘</Kbd> : <Kbd>Ctrl</Kbd>}
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(HEADER_ICON_BUTTON_CLASS, "sm:hidden rounded-none")}
          onClick={handleOpen}
          aria-label={t.search.triggerLabel}
        >
          <Search className="size-4" />
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setHydrating(false);
          }
        }}
      >
        <DialogContent className="rounded-none sm:max-w-lg gap-0 p-0 overflow-hidden">
          <DialogHeader className="sm:border-b sm:border-border sm:px-4 sm:py-3">
            <DialogTitle className="font-heading text-base">{t.search.title}</DialogTitle>
          </DialogHeader>
          {open ? (
            <GlobalSearchDialogBody
              query={query}
              onQueryChange={setQuery}
              hydrating={hydrating}
              onSelect={handleSelect}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
