"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { isSearchFirstUse, markSearchUsed } from "@/lib/nimbus/search-first-use";
import {
  enqueueNimbusMessage,
  NIMBUS_MESSAGE_PRIORITY,
} from "@/lib/nimbus/message-dispatcher";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearchStoresSnapshot } from "@/lib/hooks/use-search-stores-snapshot";
import { useIsMac } from "@/lib/hooks/use-is-mac";
import { useT } from "@/lib/lang-context";
import { buildSearchIndexInput } from "@/lib/search/collect-search-index";
import { buildSearchIndex, filterSearchResults } from "@/lib/search/global-search";
import {
  prefetchSearchListStores,
  prefetchSearchShoppingItems,
} from "@/lib/search/prefetch-search-stores";
import { HEADER_CONTROL_HEIGHT, HEADER_ICON_BUTTON_CLASS } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function GlobalSearchDialog() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [hydrating, setHydrating] = useState<boolean>(false);
  const snapshot = useSearchStoresSnapshot();
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
    if (!open || query.trim().length < 2) return;
    const timer = window.setTimeout(() => {
      void prefetchSearchShoppingItems();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open, query]);

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

  const results = useMemo(() => {
    const index = buildSearchIndex(
      buildSearchIndexInput(t.dashboard.moduleLabels, t.dashboard.moduleDescs, snapshot)
    );
    return filterSearchResults(index, query);
  }, [query, snapshot, t.dashboard.moduleLabels, t.dashboard.moduleDescs]);

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
          <div className="p-4 space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="rounded-none"
              autoFocus
            />
            <ul className="max-h-80 overflow-y-auto border border-border divide-y divide-border">
              {hydrating && results.length === 0 ? (
                <li className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t.search.loading}
                </li>
              ) : results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {t.search.empty}
                </li>
              ) : (
                results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left",
                        "hover:bg-muted/60 transition-colors cursor-pointer"
                      )}
                      onClick={() => handleSelect(result.href)}
                    >
                      <span className="text-sm font-medium text-foreground">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {result.subtitle}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
