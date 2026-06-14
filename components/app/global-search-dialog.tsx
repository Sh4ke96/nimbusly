"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLang, useT } from "@/lib/lang-context";
import { collectSearchIndex } from "@/lib/search/collect-search-index";
import { filterSearchResults } from "@/lib/search/global-search";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function GlobalSearchDialog() {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const index = collectSearchIndex(t.dashboard.moduleLabels, lang);
    return filterSearchResults(index, query);
  }, [query, lang, t.dashboard.moduleLabels]);

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
              {results.length === 0 ? (
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
                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
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
