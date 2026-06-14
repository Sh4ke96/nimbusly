"use client";

import { Button } from "@/components/ui/button";
import {
  RESTAURANT_FILTER_ALL,
  RESTAURANT_VISIT_STATUSES,
} from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { countRestaurantsByVisitStatus } from "@/lib/restaurants/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface RestaurantVisitStatusFilterProps {
  places: RestaurantPlace[];
  value: string;
  onChange: (key: string) => void;
}

export function RestaurantVisitStatusFilter({
  places,
  value,
  onChange,
}: RestaurantVisitStatusFilterProps) {
  const t = useT();
  const counts = countRestaurantsByVisitStatus(places);

  const options: { key: string; label: string }[] = [
    { key: RESTAURANT_FILTER_ALL, label: t.restaurants.filterAll },
    ...RESTAURANT_VISIT_STATUSES.map((status) => ({
      key: status,
      label: t.restaurants.visitStatusLabels[status],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const count = counts[option.key as keyof typeof counts] ?? 0;
        if (option.key !== RESTAURANT_FILTER_ALL && count === 0) return null;

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
