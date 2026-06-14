"use client";

import { Button } from "@/components/ui/button";
import { PET_FILTER_ALL } from "@/lib/constants/pets";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface PetFilterProps {
  pets: Pet[];
  items: PetCareItem[];
  value: string;
  onChange: (key: string) => void;
}

function countPetCareByPet(
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

export function PetFilter({ pets, items, value, onChange }: PetFilterProps) {
  const t = useT();
  const counts = countPetCareByPet(items, pets);

  const options: { key: string; label: string }[] = [
    { key: PET_FILTER_ALL, label: t.pets.filterAll },
    ...pets.map((pet) => ({
      key: pet.id,
      label: pet.name,
    })),
  ];

  if (pets.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{t.pets.filterByPet}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const count = counts[option.key as keyof typeof counts] ?? 0;
          if (option.key !== PET_FILTER_ALL && count === 0) return null;

          return (
            <Button
              key={option.key}
              type="button"
              size="sm"
              variant={value === option.key ? "default" : "outline"}
              className={cn("cursor-pointer rounded-none")}
              onClick={() => onChange(option.key)}
            >
              {option.label}
              <span className="ml-1 opacity-70">({count})</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
