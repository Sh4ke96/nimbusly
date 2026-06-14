"use client";

import { Button } from "@/components/ui/button";
import {
  WATCHLIST_FILTER_ALL,
  WATCHLIST_MEDIA_TYPES,
} from "@/lib/constants/watchlist";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { countWatchlistByMediaType } from "@/lib/watchlist/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface WatchlistMediaTypeFilterProps {
  items: WatchlistItem[];
  value: string;
  onChange: (key: string) => void;
}

export function WatchlistMediaTypeFilter({
  items,
  value,
  onChange,
}: WatchlistMediaTypeFilterProps) {
  const t = useT();
  const counts = countWatchlistByMediaType(items);

  const options: { key: string; label: string }[] = [
    { key: WATCHLIST_FILTER_ALL, label: t.watchlist.filterAll },
    ...WATCHLIST_MEDIA_TYPES.map((type) => ({
      key: type,
      label: t.watchlist.mediaTypeLabels[type],
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
