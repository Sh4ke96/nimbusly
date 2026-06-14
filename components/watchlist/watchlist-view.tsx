"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { WatchlistEditDialog } from "@/components/watchlist/watchlist-edit-dialog";
import { WatchlistFormDialog } from "@/components/watchlist/watchlist-form-dialog";
import { WatchlistItemCard } from "@/components/watchlist/watchlist-item-card";
import { WatchlistMediaTypeFilter } from "@/components/watchlist/watchlist-media-type-filter";
import { WatchlistStatusFilter } from "@/components/watchlist/watchlist-status-filter";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { WATCHLIST_FILTER_ALL } from "@/lib/constants/watchlist";
import {
  filterWatchlistByMediaType,
  filterWatchlistByStatus,
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

  const [statusFilter, setStatusFilter] = useState<string>(WATCHLIST_FILTER_ALL);
  const [mediaFilter, setMediaFilter] = useState<string>(WATCHLIST_FILTER_ALL);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchItems);
  const onItemsChanged = useModuleRefresh(fetchItems);

  const filteredItems = useMemo(() => {
    const byStatus = filterWatchlistByStatus(items, statusFilter);
    return filterWatchlistByMediaType(byStatus, mediaFilter);
  }, [items, statusFilter, mediaFilter]);

  function openEdit(item: WatchlistItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  const hasActiveFilter =
    statusFilter !== WATCHLIST_FILTER_ALL || mediaFilter !== WATCHLIST_FILTER_ALL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.watchlist.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.watchlist.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.watchlist.subtitle}</p>
          </div>
          <WatchlistFormDialog onSuccess={onItemsChanged} />
        </div>

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            <WatchlistStatusFilter
              items={items}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <WatchlistMediaTypeFilter
              items={items}
              value={mediaFilter}
              onChange={setMediaFilter}
            />
          </div>
        )}

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
          <div className="grid gap-4 sm:grid-cols-2">
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
      </main>

      <WatchlistEditDialog
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onItemsChanged}
      />
    </div>
  );
}
