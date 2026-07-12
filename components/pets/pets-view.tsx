"use client";

import { useMemo, useState, useCallback } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { Pencil, Trash2, PawPrint } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { PetCareEditDialog } from "@/components/pets/pet-care-edit-dialog";
import { PetCareFormDialog } from "@/components/pets/pet-care-form-dialog";
import { PetCareItemCard } from "@/components/pets/pet-care-item-card";
import { PetsFilters } from "@/components/pets/pets-filters";
import { PetEditDialog } from "@/components/pets/pet-edit-dialog";
import { PetFormDialog } from "@/components/pets/pet-form-dialog";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PET_FILTER_ALL } from "@/lib/constants/pets";
import { PET_FORM_FIELD } from "@/lib/pets/types";
import { deletePet } from "@/app/(app)/pets/actions";
import { useActionState } from "react";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  filterPetCareByPet,
  filterPetCareByType,
  resolvePetName,
} from "@/lib/pets/filters";
import { sortPetCareByDue } from "@/lib/pets/due";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { cn } from "@/lib/utils";

export function PetsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const pets = usePetsStore((s) => s.pets);
  const careItems = usePetsStore((s) => s.careItems);
  const loaded = usePetsStore((s) => s.loaded);
  const loading = usePetsStore((s) => s.loading);
  const error = usePetsStore((s) => s.error);
  const fetchAll = usePetsStore((s) => s.fetchAll);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [petFilter, setPetFilter] = useState<string>(PET_FILTER_ALL);
  const [typeFilter, setTypeFilter] = useState<string>(PET_FILTER_ALL);
  const [editingCareItem, setEditingCareItem] = useState<PetCareItem | null>(null);
  const [careEditOpen, setCareEditOpen] = useState<boolean>(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petEditOpen, setPetEditOpen] = useState<boolean>(false);
  const [petFormOpen, setPetFormOpen] = useState<boolean>(false);
  const [careFormOpen, setCareFormOpen] = useState<boolean>(false);
  const [deletePetState, deletePetAction, deletePetPending] = useActionState(deletePet, null);

  useStoreBootstrap(loaded, error, fetchAll);
  const onDataChanged = useModuleRefresh(fetchAll);

  useActionFeedback(deletePetState, onDataChanged);

  const onRealtimeChange = useCallback(() => {
    void fetchAll(true);
  }, [fetchAll]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "pets",
    table: "pets",
    onChange: onRealtimeChange,
  });

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "pet-care-items",
    table: "pet_care_items",
    onChange: onRealtimeChange,
  });

  const filteredItems = useMemo(() => {
    const byPet = filterPetCareByPet(careItems, petFilter);
    const byType = filterPetCareByType(byPet, typeFilter);
    return sortPetCareByDue(byType);
  }, [careItems, petFilter, typeFilter]);

  const hasActiveFilter =
    petFilter !== PET_FILTER_ALL || typeFilter !== PET_FILTER_ALL;

  function openCareEdit(item: PetCareItem) {
    setEditingCareItem(item);
    setCareEditOpen(true);
  }

  function openPetEdit(pet: Pet) {
    setEditingPet(pet);
    setPetEditOpen(true);
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="default">
        <AccountBreadcrumbs current={t.pets.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.PETS_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.pets.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.pets.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.PETS_FILTERS}
              visible={!loading && careItems.length > 0}
            >
              <PetsFilters
                pets={pets}
                items={careItems}
                petFilter={petFilter}
                typeFilter={typeFilter}
                onPetChange={setPetFilter}
                onTypeChange={setTypeFilter}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.PETS_ADD}>
              <PetFormDialog
                onSuccess={onDataChanged}
                open={petFormOpen}
                onOpenChange={setPetFormOpen}
              />
            </div>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.PETS_CARE}>
              <PetCareFormDialog
                pets={pets}
                onSuccess={onDataChanged}
                open={careFormOpen}
                onOpenChange={setCareFormOpen}
              />
            </div>
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {!loading && pets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pets.map((pet) => {
                const isOwner = pet.created_by === user?.id;
                return (
                  <div
                    key={pet.id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-none border border-border px-2 py-1 text-xs"
                    )}
                  >
                    <span className="font-medium">{pet.name}</span>
                    <span className="text-muted-foreground">
                      ({t.pets.speciesLabels[pet.species]})
                    </span>
                    {isOwner && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => openPetEdit(pet)}
                          aria-label={t.pets.editBtn}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <form action={deletePetAction}>
                          <input type="hidden" name={PET_FORM_FIELD.ID} value={pet.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            disabled={deletePetPending}
                            className="size-6 cursor-pointer text-muted-foreground hover:text-destructive"
                            aria-label={t.pets.deletePetBtn}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchAll(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : pets.length === 0 ? (
          <ModuleEmptyState
            icon={PawPrint}
            message={t.pets.emptyNoPets}
            actionLabel={t.pets.addBtn}
            onAction={() => setPetFormOpen(true)}
          />
        ) : filteredItems.length === 0 ? (
          <ModuleEmptyState
            icon={PawPrint}
            message={
              careItems.length === 0
                ? t.pets.empty
                : hasActiveFilter
                  ? t.pets.emptyFiltered
                  : t.pets.empty
            }
            actionLabel={careItems.length === 0 ? t.pets.addCareBtn : undefined}
            onAction={careItems.length === 0 ? () => setCareFormOpen(true) : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.PETS_LIST}>
            {filteredItems.map((item) => (
              <PetCareItemCard
                key={item.id}
                item={item}
                petName={resolvePetName(pets, item.pet_id)}
                profile={profile}
                members={members}
                userId={user?.id}
                onEdit={() => openCareEdit(item)}
                onDeleted={onDataChanged}
              />
            ))}
          </div>
        )}
      </AppPage>

      <PetEditDialog
        pet={editingPet}
        open={petEditOpen}
        onOpenChange={setPetEditOpen}
        onSuccess={onDataChanged}
      />

      <PetCareEditDialog
        item={editingCareItem}
        open={careEditOpen}
        onOpenChange={setCareEditOpen}
        onSuccess={onDataChanged}
      />
    </div>
  );
}
