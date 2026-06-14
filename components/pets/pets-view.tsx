"use client";

import { useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { Pencil } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { PetCareEditDialog } from "@/components/pets/pet-care-edit-dialog";
import { PetCareFormDialog } from "@/components/pets/pet-care-form-dialog";
import { PetCareItemCard } from "@/components/pets/pet-care-item-card";
import { PetCareTypeFilter } from "@/components/pets/pet-care-type-filter";
import { PetEditDialog } from "@/components/pets/pet-edit-dialog";
import { PetFilter } from "@/components/pets/pet-filter";
import { PetFormDialog } from "@/components/pets/pet-form-dialog";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PET_FILTER_ALL } from "@/lib/constants/pets";
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

  const [petFilter, setPetFilter] = useState<string>(PET_FILTER_ALL);
  const [typeFilter, setTypeFilter] = useState<string>(PET_FILTER_ALL);
  const [editingCareItem, setEditingCareItem] = useState<PetCareItem | null>(null);
  const [careEditOpen, setCareEditOpen] = useState<boolean>(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petEditOpen, setPetEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchAll);
  const onDataChanged = useModuleRefresh(fetchAll);

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
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.pets.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.pets.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.pets.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PetFormDialog onSuccess={onDataChanged} />
            <PetCareFormDialog pets={pets} onSuccess={onDataChanged} />
          </div>
        </div>

        {!loading && pets.length > 0 && (
          <div className="space-y-3">
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
                    )}
                  </div>
                );
              })}
            </div>

            <PetFilter
              pets={pets}
              items={careItems}
              value={petFilter}
              onChange={setPetFilter}
            />
            <PetCareTypeFilter
              items={careItems}
              value={typeFilter}
              onChange={setTypeFilter}
            />
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
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {t.pets.emptyNoPets}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {careItems.length === 0
              ? t.pets.empty
              : hasActiveFilter
                ? t.pets.emptyFiltered
                : t.pets.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
      </main>

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
