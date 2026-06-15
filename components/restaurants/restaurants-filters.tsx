"use client";

import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  RESTAURANT_FILTER_ALL,
  RESTAURANT_VENUE_TYPES,
  RESTAURANT_VISIT_STATUSES,
} from "@/lib/constants/restaurants";
import {
  countRestaurantsByVenueType,
  countRestaurantsByVisitStatus,
} from "@/lib/restaurants/filters";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { countActiveFilters } from "@/lib/filters/active-count";
import { useT } from "@/lib/lang-context";

interface RestaurantsFiltersProps {
  places: RestaurantPlace[];
  visitFilter: string;
  venueFilter: string;
  onVisitChange: (value: string) => void;
  onVenueChange: (value: string) => void;
}

export function RestaurantsFilters({
  places,
  visitFilter,
  venueFilter,
  onVisitChange,
  onVenueChange,
}: RestaurantsFiltersProps) {
  const t = useT();
  const visitCounts = countRestaurantsByVisitStatus(places);
  const venueCounts = countRestaurantsByVenueType(places);
  const activeCount = countActiveFilters(
    [visitFilter, venueFilter],
    RESTAURANT_FILTER_ALL
  );

  function clearAll() {
    onVisitChange(RESTAURANT_FILTER_ALL);
    onVenueChange(RESTAURANT_FILTER_ALL);
  }

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={clearAll}
    >
      <div className="space-y-6">
        <FilterSheetSection label={t.restaurants.visitStatusLabel}>
          <FilterToggleGroup
            value={visitFilter}
            onChange={onVisitChange}
            options={[
              {
                value: RESTAURANT_FILTER_ALL,
                label: t.restaurants.filterAll,
                count: visitCounts.all,
              },
              ...RESTAURANT_VISIT_STATUSES.map((status) => ({
                value: status,
                label: t.restaurants.visitStatusLabels[status],
                count: visitCounts[status],
              })),
            ]}
            allValue={RESTAURANT_FILTER_ALL}
          />
        </FilterSheetSection>

        <FilterSheetSection label={t.restaurants.venueTypeLabel}>
          <FilterToggleGroup
            value={venueFilter}
            onChange={onVenueChange}
            options={[
              {
                value: RESTAURANT_FILTER_ALL,
                label: t.restaurants.filterAll,
                count: venueCounts.all,
              },
              ...RESTAURANT_VENUE_TYPES.map((type) => ({
                value: type,
                label: t.restaurants.venueTypeLabels[type],
                count: venueCounts[type],
              })),
            ]}
            allValue={RESTAURANT_FILTER_ALL}
          />
        </FilterSheetSection>
      </div>
    </FilterSheet>
  );
}
