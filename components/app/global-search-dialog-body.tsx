"use client";

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { QuickAddPanel } from "@/components/app/quick-add-panel";
import { Input } from "@/components/ui/input";
import { useSearchStoresSnapshot } from "@/lib/hooks/use-search-stores-snapshot";
import { useT } from "@/lib/lang-context";
import { buildSearchIndexInput } from "@/lib/search/collect-search-index";
import { buildSearchIndex, filterSearchResults } from "@/lib/search/global-search";
import { prefetchSearchShoppingItems } from "@/lib/search/prefetch-search-stores";
import { useQuickAddEnabled } from "@/lib/hooks/use-quick-add-enabled";
import { cn } from "@/lib/utils";

type GlobalSearchDialogBodyProps = {
  query: string;
  onQueryChange: (value: string) => void;
  hydrating: boolean;
  onSelect: (href: string) => void;
  onQuickAddSuccess?: () => void;
};

/** Subscribes to module stores only while the search dialog is open. */
export function GlobalSearchDialogBody({
  query,
  onQueryChange,
  hydrating,
  onSelect,
  onQuickAddSuccess,
}: GlobalSearchDialogBodyProps) {
  const t = useT();
  const quickAddEnabled = useQuickAddEnabled();
  const snapshot = useSearchStoresSnapshot();

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(() => {
      void prefetchSearchShoppingItems();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    const index = buildSearchIndex(
      buildSearchIndexInput(t.dashboard.moduleLabels, t.dashboard.moduleDescs, snapshot)
    );
    return filterSearchResults(index, query);
  }, [query, snapshot, t.dashboard.moduleLabels, t.dashboard.moduleDescs]);

  const trimmedQuery = query.trim();
  const showQuickAdd = quickAddEnabled && trimmedQuery.length === 0;

  return (
    <div className="p-4 space-y-4 sm:p-5">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t.search.placeholder}
        className="rounded-none"
        autoFocus
      />
      {showQuickAdd ? (
        <QuickAddPanel onSuccess={onQuickAddSuccess} />
      ) : trimmedQuery.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">{t.search.searchOnlyHint}</p>
      ) : (
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
                  onClick={() => onSelect(result.href)}
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
      )}
    </div>
  );
}
