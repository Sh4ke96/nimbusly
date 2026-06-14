"use client";

import { Button } from "@/components/ui/button";
import {
  RESTAURANT_FILTER_ALL,
  RESTAURANT_VENUE_TYPES,
} from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { countRestaurantsByVenueType } from "@/lib/restaurants/filters";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface RestaurantVenueTypeFilterProps {
  places: RestaurantPlace[];
  value: string;
  onChange: (key: string) => void;
}

export function RestaurantVenueTypeFilter({
  places,
  value,
  onChange,
}: RestaurantVenueTypeFilterProps) {
  const t = useT();
  const counts = countRestaurantsByVenueType(places);

  const options: { key: string; label: string }[] = [
    { key: RESTAURANT_FILTER_ALL, label: t.restaurants.filterAll },
    ...RESTAURANT_VENUE_TYPES.map((type) => ({
      key: type,
      label: t.restaurants.venueTypeLabels[type],
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
