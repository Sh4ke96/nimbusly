"use client";

import { Button } from "@/components/ui/button";
import {
  PET_CARE_TYPES,
  PET_FILTER_ALL,
} from "@/lib/constants/pets";
import type { PetCareItem } from "@/lib/pets/types";
import { countPetCareByType } from "@/lib/pets/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface PetCareTypeFilterProps {
  items: PetCareItem[];
  value: string;
  onChange: (key: string) => void;
}

export function PetCareTypeFilter({
  items,
  value,
  onChange,
}: PetCareTypeFilterProps) {
  const t = useT();
  const counts = countPetCareByType(items);

  const options: { key: string; label: string }[] = [
    { key: PET_FILTER_ALL, label: t.pets.filterAll },
    ...PET_CARE_TYPES.map((type) => ({
      key: type,
      label: t.pets.careTypeLabels[type],
    })),
  ];

  return (
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
  );
}
