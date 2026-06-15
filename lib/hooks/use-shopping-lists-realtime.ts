"use client";

import { useEffect } from "react";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { createClient } from "@/lib/supabase/client";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import type { ShoppingList, ShoppingListItem } from "@/lib/shopping-lists/types";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useShoppingListsRealtime(params: {
  userId: string | undefined;
  familyId: string | null;
}) {
  const { userId, familyId } = params;
  const applyListChange = useShoppingListsStore((s) => s.applyListChange);
  const applyItemChange = useShoppingListsStore((s) => s.applyItemChange);
  const applyCategoryChange = useShoppingCategoriesStore((s) => s.applyCategoryChange);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = `shopping-lists:${userId}:${familyId ?? ACCOUNT_MODE.SOLO}`;
    const channel = supabase.channel(channelName);

    const listsFilter = familyId
      ? `family_id=eq.${familyId}`
      : `created_by=eq.${userId}`;

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shopping_lists",
        filter: listsFilter,
      },
      (payload) => {
        applyListChange(payload as RealtimePostgresChangesPayload<ShoppingList>);
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shopping_list_items",
      },
      (payload) => {
        const listId =
          (payload.new as ShoppingListItem | undefined)?.list_id ??
          (payload.old as ShoppingListItem | undefined)?.list_id;
        if (!listId) return;
        applyItemChange(listId, payload as RealtimePostgresChangesPayload<ShoppingListItem>);
      }
    );

    if (familyId) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_categories",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          applyCategoryChange(
            payload as RealtimePostgresChangesPayload<ShoppingListCategory>
          );
        }
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, familyId, applyListChange, applyItemChange, applyCategoryChange]);
}
