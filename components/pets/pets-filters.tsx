"use client";

import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  PET_CARE_TYPES,
  PET_FILTER_ALL,
} from "@/lib/constants/pets";
import {
  countPetCareByPet,
  countPetCareByType,
} from "@/lib/pets/filters";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { countActiveFilters } from "@/lib/filters/active-count";
import { useT } from "@/lib/lang-context";

interface PetsFiltersProps {
  pets: Pet[];
  items: PetCareItem[];
  petFilter: string;
  typeFilter: string;
  onPetChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export function PetsFilters({
  pets,
  items,
  petFilter,
  typeFilter,
  onPetChange,
  onTypeChange,
}: PetsFiltersProps) {
  const t = useT();
  const petCounts = countPetCareByPet(items, pets);
  const typeCounts = countPetCareByType(items);
  const activeCount = countActiveFilters([petFilter, typeFilter], PET_FILTER_ALL);

  function clearAll() {
    onPetChange(PET_FILTER_ALL);
    onTypeChange(PET_FILTER_ALL);
  }

  if (pets.length === 0) return null;

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={clearAll}
    >
      <div className="space-y-6">
        <FilterSheetSection label={t.pets.filterByPet}>
          <FilterToggleGroup
            value={petFilter}
            onChange={onPetChange}
            options={[
              { value: PET_FILTER_ALL, label: t.pets.filterAll, count: petCounts.all },
              ...pets.map((pet) => ({
                value: pet.id,
                label: pet.name,
                count: petCounts[pet.id] ?? 0,
              })),
            ]}
            allValue={PET_FILTER_ALL}
          />
        </FilterSheetSection>

        <FilterSheetSection label={t.pets.careTypeLabel}>
          <FilterToggleGroup
            value={typeFilter}
            onChange={onTypeChange}
            options={[
              { value: PET_FILTER_ALL, label: t.pets.filterAll, count: typeCounts.all },
              ...PET_CARE_TYPES.map((type) => ({
                value: type,
                label: t.pets.careTypeLabels[type],
                count: typeCounts[type],
              })),
            ]}
            allValue={PET_FILTER_ALL}
          />
        </FilterSheetSection>
      </div>
    </FilterSheet>
  );
}
