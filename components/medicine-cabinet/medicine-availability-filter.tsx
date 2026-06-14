"use client";

import { Button } from "@/components/ui/button";
import {
  MEDICINE_AVAILABILITIES,
  MEDICINE_FILTER_ALL,
} from "@/lib/constants/medicine";
import type { MedicineItem } from "@/lib/medicine/types";
import { countMedicineByAvailability } from "@/lib/medicine/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface MedicineAvailabilityFilterProps {
  items: MedicineItem[];
  value: string;
  onChange: (key: string) => void;
}

export function MedicineAvailabilityFilter({
  items,
  value,
  onChange,
}: MedicineAvailabilityFilterProps) {
  const t = useT();
  const counts = countMedicineByAvailability(items);

  const options: { key: string; label: string }[] = [
    { key: MEDICINE_FILTER_ALL, label: t.medicineCabinet.filterAll },
    ...MEDICINE_AVAILABILITIES.map((status) => ({
      key: status,
      label: t.medicineCabinet.availabilityLabels[status],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count = counts[option.key as keyof typeof counts] ?? 0;
        if (option.key !== MEDICINE_FILTER_ALL && count === 0) return null;

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
