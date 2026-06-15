"use client";

import {
  FilterSelectField,
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  WATCHLIST_FILTER_ALL,
  WATCHLIST_MEDIA_TYPES,
  WATCHLIST_STATUSES,
} from "@/lib/constants/watchlist";
import { STREAMING_PLATFORMS } from "@/lib/constants/watchlist-streaming";
import { countActiveFilters } from "@/lib/filters/active-count";
import {
  countWatchlistByMediaType,
  countWatchlistByStatus,
  countWatchlistByStreamingPlatform,
} from "@/lib/watchlist/filters";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { useT } from "@/lib/lang-context";

interface WatchlistFiltersProps {
  items: WatchlistItem[];
  statusFilter: string;
  mediaFilter: string;
  platformFilter: string;
  onStatusChange: (value: string) => void;
  onMediaChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
}

export function WatchlistFilters({
  items,
  statusFilter,
  mediaFilter,
  platformFilter,
  onStatusChange,
  onMediaChange,
  onPlatformChange,
}: WatchlistFiltersProps) {
  const t = useT();
  const statusCounts = countWatchlistByStatus(items);
  const mediaCounts = countWatchlistByMediaType(items);
  const platformCounts = countWatchlistByStreamingPlatform(items);

  const activeCount = countActiveFilters(
    [statusFilter, mediaFilter, platformFilter],
    WATCHLIST_FILTER_ALL
  );

  function clearAll() {
    onStatusChange(WATCHLIST_FILTER_ALL);
    onMediaChange(WATCHLIST_FILTER_ALL);
    onPlatformChange(WATCHLIST_FILTER_ALL);
  }

  const statusOptions = [
    { value: WATCHLIST_FILTER_ALL, label: t.watchlist.filterAll, count: statusCounts.all },
    ...WATCHLIST_STATUSES.map((status) => ({
      value: status,
      label: t.watchlist.statusLabels[status],
      count: statusCounts[status],
    })),
  ];

  const mediaOptions = [
    { value: WATCHLIST_FILTER_ALL, label: t.watchlist.filterAll, count: mediaCounts.all },
    ...WATCHLIST_MEDIA_TYPES.map((type) => ({
      value: type,
      label: t.watchlist.mediaTypeLabels[type],
      count: mediaCounts[type],
    })),
  ];

  const platformOptions = [
    { value: WATCHLIST_FILTER_ALL, label: t.watchlist.filterAll, count: platformCounts.all },
    ...STREAMING_PLATFORMS.map((platform) => ({
      value: platform,
      label: t.watchlist.streamingPlatformLabels[platform],
      count: platformCounts[platform],
    })),
  ];

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={clearAll}
    >
      <div className="space-y-6">
        <FilterSheetSection label={t.watchlist.statusLabel} hint={t.watchlist.statusHint}>
          <FilterToggleGroup
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            allValue={WATCHLIST_FILTER_ALL}
          />
        </FilterSheetSection>

        <FilterSheetSection label={t.watchlist.mediaTypeLabel}>
          <FilterToggleGroup
            value={mediaFilter}
            onChange={onMediaChange}
            options={mediaOptions}
            allValue={WATCHLIST_FILTER_ALL}
          />
        </FilterSheetSection>

        {STREAMING_PLATFORMS.some((platform) => platformCounts[platform] > 0) ? (
          <FilterSheetSection label={t.watchlist.streamingPlatformFilterLabel}>
            <FilterSelectField
              value={platformFilter}
              onChange={onPlatformChange}
              options={platformOptions}
              allValue={WATCHLIST_FILTER_ALL}
              placeholder={t.watchlist.streamingPlatformFilterPlaceholder}
              ariaLabel={t.watchlist.streamingPlatformFilterLabel}
            />
          </FilterSheetSection>
        ) : null}
      </div>
    </FilterSheet>
  );
}
