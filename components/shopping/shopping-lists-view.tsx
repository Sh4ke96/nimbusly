"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useResolvedItemSelection } from "@/lib/hooks/use-resolved-item-selection";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { ShoppingListCard } from "@/components/shopping/shopping-list-card";
import { ShoppingListEditDialog } from "@/components/shopping/shopping-list-edit-dialog";
import { ShoppingListFormDialog } from "@/components/shopping/shopping-list-form-dialog";
import { ShoppingListWatchButton } from "@/components/shopping/shopping-list-watch-button";
import { ShoppingListItemsPanel } from "@/components/shopping/shopping-list-items-panel";
import { Button } from "@/components/ui/button";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useShoppingListsRealtime } from "@/lib/hooks/use-shopping-lists-realtime";
import { downloadShoppingListCsv } from "@/lib/shopping-lists/export-csv";
import { useT } from "@/lib/lang-context";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { useProfileStore } from "@/lib/stores/profile-store";
import {
  EMPTY_SHOPPING_LIST_ITEMS,
  selectShoppingListItems,
  useShoppingListsStore,
} from "@/lib/stores/shopping-lists-store";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { ModuleSectionHeading } from "@/components/ui/module-section-heading";
import { ClipboardList, Download, ShoppingBag } from "lucide-react";

export function ShoppingListsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const lists = useShoppingListsStore((s) => s.lists);
  const loaded = useShoppingListsStore((s) => s.loaded);
  const loading = useShoppingListsStore((s) => s.loading);
  const error = useShoppingListsStore((s) => s.error);
  const fetchLists = useShoppingListsStore((s) => s.fetchLists);
  const fetchWatches = useShoppingListsStore((s) => s.fetchWatches);
  const fetchItems = useShoppingListsStore((s) => s.fetchItems);

  const listIdsKey = useMemo(() => lists.map((list) => list.id).join("|"), [lists]);
  const [activeListId, setSelectedListId] = useResolvedItemSelection(listIdsKey);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  useStoreBootstrap(loaded, error, fetchLists);

  useEffect(() => {
    void fetchWatches();
  }, [fetchWatches]);

  useEffect(() => {
    if (activeListId) void fetchItems(activeListId);
  }, [activeListId, fetchItems]);

  useShoppingListsRealtime({
    userId: user?.id,
    familyId,
  });

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? null,
    [lists, activeListId]
  );

  const selectItems = useMemo(
    () =>
      activeListId
        ? selectShoppingListItems(activeListId)
        : () => EMPTY_SHOPPING_LIST_ITEMS,
    [activeListId]
  );
  const activeListItems = useShoppingListsStore(selectItems);

  const onWatchChanged = () => {
    void fetchWatches(true);
  };

  const refreshLists = useModuleRefresh(fetchLists);
  const onListsChanged = useCallback(() => {
    refreshLists();
    if (activeListId) void fetchItems(activeListId, true);
  }, [refreshLists, activeListId, fetchItems]);

  function openEdit(list: ShoppingList) {
    setEditingList(list);
    setEditOpen(true);
  }

  function handleExportCsv() {
    if (!activeList) return;
    downloadShoppingListCsv({
      list: activeList,
      items: activeListItems,
      labels: {
        item: t.shoppingLists.itemsHeading,
        quantity: t.shoppingLists.quantityLabel,
        checked: t.shoppingLists.toggleItemLabel,
        yes: t.shoppingLists.csvYes,
        no: t.shoppingLists.csvNo,
      },
    });
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="wide">
        <AccountBreadcrumbs current={t.shoppingLists.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.shoppingLists.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.shoppingLists.subtitle}</p>
          </div>
          <div data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_ADD}>
            <ShoppingListFormDialog onSuccess={onListsChanged} />
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchLists(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-64 w-full rounded-none" />
          </div>
        ) : lists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {t.shoppingLists.empty}
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className="space-y-3" data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_LISTS}>
              <ModuleSectionHeading icon={ClipboardList}>
                {t.shoppingLists.listsHeading}
              </ModuleSectionHeading>
              <div className="space-y-3">
                {lists.map((list) => (
                  <ShoppingListCard
                    key={list.id}
                    list={list}
                    selected={list.id === activeListId}
                    onSelect={() => setSelectedListId(list.id)}
                    onEdit={() => openEdit(list)}
                    onDeleted={onListsChanged}
                    onWatchChanged={onWatchChanged}
                  />
                ))}
              </div>
            </section>

            <section className="min-w-0 w-full space-y-3" data-nimbus-tour={NIMBUS_TOUR_TARGET.SHOPPING_ITEMS}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ModuleSectionHeading icon={ShoppingBag}>
                  {activeList?.name ?? t.shoppingLists.itemsHeading}
                </ModuleSectionHeading>
                {activeList ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={handleExportCsv}
                    >
                      <Download className="size-4" />
                      {t.module.exportCsv}
                    </Button>
                    {activeListId ? (
                      <NimbusTourToolbarAnchor
                        tourTarget={NIMBUS_TOUR_TARGET.SHOPPING_WATCH}
                        visible={!!activeListId}
                      >
                        <ShoppingListWatchButton
                          listId={activeListId}
                          onChanged={onWatchChanged}
                        />
                      </NimbusTourToolbarAnchor>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {activeListId ? (
                <ShoppingListItemsPanel
                  listId={activeListId}
                  onChanged={() => {
                    void fetchLists(true);
                    if (activeListId) void fetchItems(activeListId, true);
                  }}
                />
              ) : null}
            </section>
          </div>
        )}
      </AppPage>

      <ShoppingListEditDialog
        list={editingList}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onListsChanged}
      />
    </div>
  );
}
