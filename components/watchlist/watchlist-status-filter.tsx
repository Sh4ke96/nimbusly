"use client";

import { Button } from "@/components/ui/button";
import {
  WATCHLIST_FILTER_ALL,
  WATCHLIST_STATUSES,
} from "@/lib/constants/watchlist";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { countWatchlistByStatus } from "@/lib/watchlist/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface WatchlistStatusFilterProps {
  items: WatchlistItem[];
  value: string;
  onChange: (key: string) => void;
}

export function WatchlistStatusFilter({
  items,
  value,
  onChange,
}: WatchlistStatusFilterProps) {
  const t = useT();
  const counts = countWatchlistByStatus(items);

  const options: { key: string; label: string }[] = [
    { key: WATCHLIST_FILTER_ALL, label: t.watchlist.filterAll },
    ...WATCHLIST_STATUSES.map((status) => ({
      key: status,
      label: t.watchlist.statusLabels[status],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count = counts[option.key as keyof typeof counts] ?? 0;
        if (option.key !== WATCHLIST_FILTER_ALL && count === 0) return null;

        return (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={value === option.key ? "default" : "outline"}
            className={cn("cursor-pointer rounded-none")}
            onClick={() => onChange(option.key)}
          >
            {option.label}
            <span className="ml-1 opacity-70">({count})</span>
          </Button>
        );
      })}
    </div>
  );
}
