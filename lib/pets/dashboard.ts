import { isPetCareDueSoon, sortPetCareByDue } from "@/lib/pets/due";
import type { Pet, PetCareItem } from "@/lib/pets/types";

export interface PetCarePreviewRow {
  item: PetCareItem;
  petName: string;
}

export function pickDuePetCarePreview(
  items: PetCareItem[],
  pets: Pet[],
  limit = 3
): PetCarePreviewRow[] {
  const due = sortPetCareByDue(
    items.filter((item) => isPetCareDueSoon(item.next_due_date))
  );

  return due.slice(0, limit).map((item) => ({
    item,
    petName: pets.find((pet) => pet.id === item.pet_id)?.name ?? "",
  }));
}
