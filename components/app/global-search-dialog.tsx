"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearchStoresSnapshot } from "@/lib/hooks/use-search-stores-snapshot";
import { useT } from "@/lib/lang-context";
import { buildSearchIndexInput } from "@/lib/search/collect-search-index";
import { buildSearchIndex, filterSearchResults } from "@/lib/search/global-search";
import { prefetchSearchStores } from "@/lib/search/prefetch-search-stores";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function GlobalSearchDialog() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [hydrating, setHydrating] = useState<boolean>(false);
  const snapshot = useSearchStoresSnapshot();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setHydrating(true);
    void prefetchSearchStores().finally(() => {
      if (!cancelled) setHydrating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          HEADER_CONTROL_HEIGHT,
          "hidden sm:inline-flex max-w-52 justify-start gap-2 rounded-none border-border bg-muted/40 px-2.5 text-muted-foreground font-normal"
        )}
        onClick={() => setOpen(true)}
        aria-label={t.search.triggerLabel}
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{t.search.triggerLabel}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(HEADER_CONTROL_HEIGHT, "w-8 sm:hidden rounded-none shrink-0")}
        onClick={() => setOpen(true)}
        aria-label={t.search.triggerLabel}
      >
        <Search className="size-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="rounded-none sm:max-w-lg gap-0 p-0 overflow-hidden">
          <DialogHeader className="border-b border-border px-4 py-3">
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
