"use client";

import { useMemo, useState, useCallback } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { WatchlistEditDialog } from "@/components/watchlist/watchlist-edit-dialog";
import { WatchlistFilters } from "@/components/watchlist/watchlist-filters";
import { WatchlistFormDialog } from "@/components/watchlist/watchlist-form-dialog";
import { WatchlistItemCard } from "@/components/watchlist/watchlist-item-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { WATCHLIST_FILTER_ALL } from "@/lib/constants/watchlist";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  filterWatchlistByMediaType,
  filterWatchlistByStatus,
  filterWatchlistByStreamingPlatform,
} from "@/lib/watchlist/filters";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

export function WatchlistView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const items = useWatchlistStore((s) => s.items);
  const loaded = useWatchlistStore((s) => s.loaded);
  const loading = useWatchlistStore((s) => s.loading);
  const error = useWatchlistStore((s) => s.error);
  const fetchItems = useWatchlistStore((s) => s.fetchItems);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [statusFilter, setStatusFilter] = useState<string>(WATCHLIST_FILTER_ALL);
  const [mediaFilter, setMediaFilter] = useState<string>(WATCHLIST_FILTER_ALL);
  const [platformFilter, setPlatformFilter] = useState<string>(WATCHLIST_FILTER_ALL);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchItems);
  const onItemsChanged = useModuleRefresh(fetchItems);

  const onRealtimeChange = useCallback(() => {
    void fetchItems(true);
  }, [fetchItems]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "watchlist-items",
    table: "watchlist_items",
    onChange: onRealtimeChange,
  });

  const filteredItems = useMemo(() => {
    const byStatus = filterWatchlistByStatus(items, statusFilter);
    const byMedia = filterWatchlistByMediaType(byStatus, mediaFilter);
    return filterWatchlistByStreamingPlatform(byMedia, platformFilter);
  }, [items, statusFilter, mediaFilter, platformFilter]);

  function openEdit(item: WatchlistItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  const hasActiveFilter =
    statusFilter !== WATCHLIST_FILTER_ALL ||
    mediaFilter !== WATCHLIST_FILTER_ALL ||
    platformFilter !== WATCHLIST_FILTER_ALL;

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="default">
        <AccountBreadcrumbs current={t.watchlist.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.WATCHLIST_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.watchlist.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.watchlist.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.WATCHLIST_FILTERS}
              visible={!loading && items.length > 0}
            >
              <WatchlistFilters
                items={items}
                statusFilter={statusFilter}
                mediaFilter={mediaFilter}
                platformFilter={platformFilter}
                onStatusChange={setStatusFilter}
                onMediaChange={setMediaFilter}
                onPlatformChange={setPlatformFilter}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.WATCHLIST_ADD}>
              <WatchlistFormDialog onSuccess={onItemsChanged} />
            </div>
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchItems(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {items.length === 0
              ? t.watchlist.empty
              : hasActiveFilter
                ? t.watchlist.emptyFiltered
                : t.watchlist.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.WATCHLIST_LIST}>
            {filteredItems.map((item) => (
              <WatchlistItemCard
                key={item.id}
                item={item}
                profile={profile}
                members={members}
                userId={user?.id}
                onEdit={() => openEdit(item)}
                onChanged={onItemsChanged}
              />
            ))}
          </div>
        )}
      </AppPage>

      <WatchlistEditDialog
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onItemsChanged}
      />
    </div>
  );
}
