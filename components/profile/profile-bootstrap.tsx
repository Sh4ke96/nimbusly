"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";

function deferAuthSideEffect(fn: () => void) {
  window.setTimeout(fn, 0);
}

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const fetchSession = useProfileStore.getState().fetchSession;
    const fetchNotifications = useNotificationsStore.getState().fetchNotifications;

    void fetchSession().then(() => fetchNotifications());

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;

      if (event === "SIGNED_OUT") {
        useProfileStore.getState().reset();
        useNotificationsStore.getState().reset();
        useGiftsStore.getState().reset();
        useMedicineStore.getState().reset();
        useWatchlistStore.getState().reset();
        useRestaurantsStore.getState().reset();
        usePetsStore.getState().reset();
        useChoresStore.getState().reset();
        useShoppingListsStore.getState().reset();
        useBudgetStore.getState().reset();
        useScheduleStore.getState().reset();
        useBirthdaysStore.getState().reset();
        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        deferAuthSideEffect(() => {
          void useProfileStore
            .getState()
            .fetchSession(true)
            .then(() => useNotificationsStore.getState().fetchNotifications(true));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return children;
}
