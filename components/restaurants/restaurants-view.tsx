"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { RestaurantEditDialog } from "@/components/restaurants/restaurant-edit-dialog";
import { RestaurantFormDialog } from "@/components/restaurants/restaurant-form-dialog";
import { RestaurantPlaceCard } from "@/components/restaurants/restaurant-place-card";
import { RestaurantVenueTypeFilter } from "@/components/restaurants/restaurant-venue-type-filter";
import { RestaurantVisitStatusFilter } from "@/components/restaurants/restaurant-visit-status-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { RESTAURANT_FILTER_ALL } from "@/lib/constants/restaurants";
import {
  filterRestaurantsByVenueType,
  filterRestaurantsByVisitStatus,
  sortRestaurantsByVisitedAt,
} from "@/lib/restaurants/filters";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function RestaurantsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const places = useRestaurantsStore((s) => s.places);
  const loaded = useRestaurantsStore((s) => s.loaded);
  const loading = useRestaurantsStore((s) => s.loading);
  const fetchPlaces = useRestaurantsStore((s) => s.fetchPlaces);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const [visitFilter, setVisitFilter] = useState<string>(RESTAURANT_FILTER_ALL);
  const [venueFilter, setVenueFilter] = useState<string>(RESTAURANT_FILTER_ALL);
  const [editingPlace, setEditingPlace] = useState<RestaurantPlace | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!loaded) void fetchPlaces();
  }, [loaded, fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    const byVisit = filterRestaurantsByVisitStatus(places, visitFilter);
    const byVenue = filterRestaurantsByVenueType(byVisit, venueFilter);
    return sortRestaurantsByVisitedAt(byVenue);
  }, [places, visitFilter, venueFilter]);

  const onPlacesChanged = () => {
    void fetchPlaces(true);
    void fetchNotifications(true);
  };

  function openEdit(place: RestaurantPlace) {
    setEditingPlace(place);
    setEditOpen(true);
  }

  const hasActiveFilter =
    visitFilter !== RESTAURANT_FILTER_ALL || venueFilter !== RESTAURANT_FILTER_ALL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.restaurants.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.restaurants.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.restaurants.subtitle}</p>
          </div>
          <RestaurantFormDialog onSuccess={onPlacesChanged} />
        </div>

        {!loading && places.length > 0 && (
          <div className="space-y-3">
            <RestaurantVisitStatusFilter
              places={places}
              value={visitFilter}
              onChange={setVisitFilter}
            />
            <RestaurantVenueTypeFilter
              places={places}
              value={venueFilter}
              onChange={setVenueFilter}
            />
          </div>
        )}

        {loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-none sm:col-span-2" />
            <Skeleton className="h-64 w-full rounded-none sm:col-span-2" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {places.length === 0
              ? t.restaurants.empty
              : hasActiveFilter
                ? t.restaurants.emptyFiltered
                : t.restaurants.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
      </main>

      <RestaurantEditDialog
        place={editingPlace}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onPlacesChanged}
      />
    </div>
  );
}
