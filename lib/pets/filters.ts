import { PET_FILTER_ALL } from "@/lib/constants/pets";
import type { PetCareType } from "@/lib/constants/pets";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { isPetCareDueSoon } from "@/lib/pets/due";

export function filterPetCareByPet(
  items: PetCareItem[],
  petId: string
): PetCareItem[] {
  if (petId === PET_FILTER_ALL) return items;
  return items.filter((item) => item.pet_id === petId);
}

export function filterPetCareByType(
  items: PetCareItem[],
  filterKey: string
): PetCareItem[] {
  if (filterKey === PET_FILTER_ALL) return items;
  return items.filter((item) => item.care_type === filterKey);
}

export function countPetCareByType(
  items: PetCareItem[]
): Record<PetCareType | "all", number> {
  const counts = {
    all: items.length,
    vaccination: 0,
    vet_visit: 0,
    deworming: 0,
    medication: 0,
    food: 0,
    other: 0,
  } as Record<PetCareType | "all", number>;

  for (const item of items) {
    counts[item.care_type] += 1;
  }

  return counts;
}

export function countPetCareByPet(
  items: PetCareItem[],
  pets: Pet[]
): Record<string, number> & { all: number } {
  const counts: Record<string, number> & { all: number } = { all: items.length };
  for (const pet of pets) {
    counts[pet.id] = 0;
  }
  for (const item of items) {
    if (counts[item.pet_id] !== undefined) {
      counts[item.pet_id] += 1;
    }
  }
  return counts;
}

export function countDuePetCareItems(items: PetCareItem[]): number {
  return items.filter((item) => isPetCareDueSoon(item.next_due_date)).length;
}

export function resolvePetName(pets: Pet[], petId: string): string {
  return pets.find((pet) => pet.id === petId)?.name ?? "";
}
