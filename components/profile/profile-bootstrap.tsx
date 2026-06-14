"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useBudgetStore } from "@/lib/stores/budget-store";

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const fetchSession = useProfileStore((s) => s.fetchSession);
  const resetProfile = useProfileStore((s) => s.reset);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const resetNotifications = useNotificationsStore((s) => s.reset);
  const resetGifts = useGiftsStore((s) => s.reset);
  const resetMedicine = useMedicineStore((s) => s.reset);
  const resetWatchlist = useWatchlistStore((s) => s.reset);
  const resetRestaurants = useRestaurantsStore((s) => s.reset);
  const resetShoppingLists = useShoppingListsStore((s) => s.reset);
  const resetBudget = useBudgetStore((s) => s.reset);

  useEffect(() => {
    void fetchSession().then(() => fetchNotifications());

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        resetProfile();
        resetNotifications();
        resetGifts();
        resetMedicine();
        resetWatchlist();
        resetRestaurants();
        resetShoppingLists();
        resetBudget();
        return;
      }

      void fetchSession(true).then(() => fetchNotifications(true));
    });

    return () => subscription.unsubscribe();
  }, [fetchSession, fetchNotifications, resetProfile, resetNotifications, resetGifts, resetMedicine, resetWatchlist, resetRestaurants, resetShoppingLists, resetBudget]);

  return children;
}
