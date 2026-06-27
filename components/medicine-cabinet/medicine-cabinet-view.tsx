"use client";

import { useMemo, useState, useCallback } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { MedicineCabinetFilters } from "@/components/medicine-cabinet/medicine-cabinet-filters";
import { MedicineEditDialog } from "@/components/medicine-cabinet/medicine-edit-dialog";
import { MedicineFormDialog } from "@/components/medicine-cabinet/medicine-form-dialog";
import { MedicineItemCard } from "@/components/medicine-cabinet/medicine-item-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { MEDICINE_FILTER_ALL } from "@/lib/constants/medicine";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { countActiveFilters } from "@/lib/filters/active-count";
import { filterMedicineByAvailability } from "@/lib/medicine/filters";
import { sortMedicineByExpiry } from "@/lib/medicine/expiry";
import type { MedicineItem } from "@/lib/medicine/types";
import { useLang, useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";

export function MedicineView() {
  const t = useT();
  const { lang } = useLang();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const items = useMedicineStore((s) => s.items);
  const loaded = useMedicineStore((s) => s.loaded);
  const loading = useMedicineStore((s) => s.loading);
  const error = useMedicineStore((s) => s.error);
  const fetchItems = useMedicineStore((s) => s.fetchItems);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [filterKey, setFilterKey] = useState<string>(MEDICINE_FILTER_ALL);
  const [editingItem, setEditingItem] = useState<MedicineItem | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchItems);
  const onItemsChanged = useModuleRefresh(fetchItems);

  const onRealtimeChange = useCallback(() => {
    void fetchItems(true);
  }, [fetchItems]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "medicine-items",
    table: "medicine_items",
    onChange: onRealtimeChange,
  });

  const filteredItems = useMemo(() => {
    const filtered = filterMedicineByAvailability(items, filterKey);
    return sortMedicineByExpiry(filtered, new Date(), lang);
  }, [items, filterKey, lang]);

  function openEdit(item: MedicineItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  const hasActiveFilter = countActiveFilters([filterKey], MEDICINE_FILTER_ALL) > 0;

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="default">
        <AccountBreadcrumbs current={t.medicineCabinet.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.MEDICINE_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.medicineCabinet.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.medicineCabinet.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.MEDICINE_FILTERS}
              visible={!loading && items.length > 0}
            >
              <MedicineCabinetFilters
                items={items}
                value={filterKey}
                onChange={setFilterKey}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.MEDICINE_ADD}>
              <MedicineFormDialog onSuccess={onItemsChanged} />
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
            {filterKey === MEDICINE_FILTER_ALL
              ? t.medicineCabinet.empty
              : hasActiveFilter
                ? t.medicineCabinet.emptyFiltered
                : t.medicineCabinet.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.MEDICINE_LIST}>
            {filteredItems.map((item) => (
              <MedicineItemCard
                key={item.id}
                item={item}
                profile={profile}
                members={members}
                userId={user?.id}
                onEdit={() => openEdit(item)}
                onDeleted={onItemsChanged}
              />
            ))}
          </div>
        )}
      </AppPage>

      <MedicineEditDialog
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onItemsChanged}
      />
    </div>
  );
}
