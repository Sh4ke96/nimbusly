"use client";

import { useMemo, useState, useCallback } from "react";
import { Clapperboard } from "lucide-react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { ModulePageHeader, ModulePageShell } from "@/components/app/module-page-shell";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { WatchlistEditDialog } from "@/components/watchlist/watchlist-edit-dialog";
import { WatchlistFilters } from "@/components/watchlist/watchlist-filters";
import { WatchlistFormDialog } from "@/components/watchlist/watchlist-form-dialog";
import { WatchlistItemCard } from "@/components/watchlist/watchlist-item-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";
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
  const [formOpen, setFormOpen] = useState<boolean>(false);

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
    <>
      <ModulePageShell>
        <ModulePageHeader
          title={t.watchlist.title}
          subtitle={t.watchlist.subtitle}
          moduleId={APP_MODULE.WATCHLIST}
          breadcrumb={t.watchlist.title}
          tourTarget={NIMBUS_TOUR_TARGET.WATCHLIST_HEADER}
          actions={
            <>
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
                <WatchlistFormDialog
                  onSuccess={onItemsChanged}
                  open={formOpen}
                  onOpenChange={setFormOpen}
                />
              </div>
            </>
          }
        />

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchItems(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : filteredItems.length === 0 ? (
          <ModuleEmptyState
            icon={Clapperboard}
            message={
              items.length === 0
                ? t.watchlist.empty
                : hasActiveFilter
                  ? t.watchlist.emptyFiltered
                  : t.watchlist.empty
            }
            actionLabel={
              hasActiveFilter
                ? t.common.clearFilters
                : items.length === 0
                  ? t.watchlist.addBtn
                  : undefined
            }
            onAction={
              hasActiveFilter
                ? () => {
                    setStatusFilter(WATCHLIST_FILTER_ALL);
                    setMediaFilter(WATCHLIST_FILTER_ALL);
                    setPlatformFilter(WATCHLIST_FILTER_ALL);
                  }
                : items.length === 0
                  ? () => setFormOpen(true)
                  : undefined
            }
          />
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
      </ModulePageShell>

      <WatchlistEditDialog
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onItemsChanged}
      />
    </>
  );
}
