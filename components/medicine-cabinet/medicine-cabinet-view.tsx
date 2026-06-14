"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { MedicineAvailabilityFilter } from "@/components/medicine-cabinet/medicine-availability-filter";
import { MedicineEditDialog } from "@/components/medicine-cabinet/medicine-edit-dialog";
import { MedicineFormDialog } from "@/components/medicine-cabinet/medicine-form-dialog";
import { MedicineItemCard } from "@/components/medicine-cabinet/medicine-item-card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { MEDICINE_FILTER_ALL } from "@/lib/constants/medicine";
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

  const [filterKey, setFilterKey] = useState<string>(MEDICINE_FILTER_ALL);
  const [editingItem, setEditingItem] = useState<MedicineItem | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchItems);
  const onItemsChanged = useModuleRefresh(fetchItems);

  const filteredItems = useMemo(() => {
    const filtered = filterMedicineByAvailability(items, filterKey);
    return sortMedicineByExpiry(filtered, new Date(), lang);
  }, [items, filterKey, lang]);

  function openEdit(item: MedicineItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.medicineCabinet.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.medicineCabinet.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.medicineCabinet.subtitle}</p>
          </div>
          <MedicineFormDialog onSuccess={onItemsChanged} />
        </div>

        {!loading && items.length > 0 && (
          <MedicineAvailabilityFilter
            items={items}
            value={filterKey}
            onChange={setFilterKey}
          />
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
            {filterKey === MEDICINE_FILTER_ALL
              ? t.medicineCabinet.empty
              : t.medicineCabinet.emptyFiltered}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
      </main>

      <MedicineEditDialog
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onItemsChanged}
      />
    </div>
  );
}
