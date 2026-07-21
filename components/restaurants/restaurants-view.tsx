"use client";

import { useMemo, useState, useCallback } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { UtensilsCrossed } from "lucide-react";
import { ModulePageHeader, ModulePageShell } from "@/components/app/module-page-shell";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { RestaurantEditDialog } from "@/components/restaurants/restaurant-edit-dialog";
import { RestaurantFormDialog } from "@/components/restaurants/restaurant-form-dialog";
import { RestaurantsFilters } from "@/components/restaurants/restaurants-filters";
import { RestaurantPlaceCard } from "@/components/restaurants/restaurant-place-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { RESTAURANT_FILTER_ALL } from "@/lib/constants/restaurants";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  filterRestaurantsByVenueType,
  filterRestaurantsByVisitStatus,
  sortRestaurantsByVisitedAt,
} from "@/lib/restaurants/filters";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";

export function RestaurantsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const places = useRestaurantsStore((s) => s.places);
  const loaded = useRestaurantsStore((s) => s.loaded);
  const loading = useRestaurantsStore((s) => s.loading);
  const error = useRestaurantsStore((s) => s.error);
  const fetchPlaces = useRestaurantsStore((s) => s.fetchPlaces);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [visitFilter, setVisitFilter] = useState<string>(RESTAURANT_FILTER_ALL);
  const [venueFilter, setVenueFilter] = useState<string>(RESTAURANT_FILTER_ALL);
  const [editingPlace, setEditingPlace] = useState<RestaurantPlace | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchPlaces);
  const onPlacesChanged = useModuleRefresh(fetchPlaces);

  const onRealtimeChange = useCallback(() => {
    void fetchPlaces(true);
  }, [fetchPlaces]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "restaurant-places",
    table: "restaurant_places",
    onChange: onRealtimeChange,
  });

  const filteredPlaces = useMemo(() => {
    const byVisit = filterRestaurantsByVisitStatus(places, visitFilter);
    const byVenue = filterRestaurantsByVenueType(byVisit, venueFilter);
    return sortRestaurantsByVisitedAt(byVenue);
  }, [places, visitFilter, venueFilter]);

  function openEdit(place: RestaurantPlace) {
    setEditingPlace(place);
    setEditOpen(true);
  }

  const hasActiveFilter =
    visitFilter !== RESTAURANT_FILTER_ALL || venueFilter !== RESTAURANT_FILTER_ALL;

  return (
    <>
      <ModulePageShell>
        <ModulePageHeader
          title={t.restaurants.title}
          subtitle={t.restaurants.subtitle}
          moduleId={APP_MODULE.RESTAURANTS}
          breadcrumb={t.restaurants.title}
          tourTarget={NIMBUS_TOUR_TARGET.RESTAURANTS_HEADER}
          actions={
            <>
              <NimbusTourToolbarAnchor
                tourTarget={NIMBUS_TOUR_TARGET.RESTAURANTS_FILTERS}
                visible={!loading && places.length > 0}
              >
                <RestaurantsFilters
                  places={places}
                  visitFilter={visitFilter}
                  venueFilter={venueFilter}
                  onVisitChange={setVisitFilter}
                  onVenueChange={setVenueFilter}
                />
              </NimbusTourToolbarAnchor>
              <div data-nimbus-tour={NIMBUS_TOUR_TARGET.RESTAURANTS_ADD}>
                <RestaurantFormDialog onSuccess={onPlacesChanged} />
              </div>
            </>
          }
        />

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchPlaces(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-none sm:col-span-2" />
            <Skeleton className="h-64 w-full rounded-none sm:col-span-2" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <ModuleEmptyState
            icon={UtensilsCrossed}
            message={
              places.length === 0
                ? t.restaurants.empty
                : hasActiveFilter
                  ? t.restaurants.emptyFiltered
                  : t.restaurants.empty
            }
            actionLabel={hasActiveFilter ? t.common.clearFilters : undefined}
            onAction={
              hasActiveFilter
                ? () => {
                    setVisitFilter(RESTAURANT_FILTER_ALL);
                    setVenueFilter(RESTAURANT_FILTER_ALL);
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.RESTAURANTS_LIST}>
            {filteredPlaces.map((place) => (
              <RestaurantPlaceCard
                key={place.id}
                place={place}
                profile={profile}
                members={members}
                userId={user?.id}
                onEdit={() => openEdit(place)}
                onChanged={onPlacesChanged}
              />
            ))}
          </div>
        )}
      </ModulePageShell>

      <RestaurantEditDialog
        place={editingPlace}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onPlacesChanged}
      />
    </>
  );
}
