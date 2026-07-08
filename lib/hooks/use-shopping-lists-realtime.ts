"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  shouldApplyShoppingListRealtimeEvent,
  type ShoppingListsRealtimeScope,
} from "@/lib/shopping-lists/realtime-scope";
import type { ShoppingListCategory } from "@/lib/shopping-lists/categories";
import type { ShoppingList, ShoppingListItem } from "@/lib/shopping-lists/types";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

function refetchShoppingListsOnResume() {
  const listsStore = useShoppingListsStore.getState();
  void listsStore.fetchLists(true);
  for (const listId of Object.keys(listsStore.itemsByListId)) {
    void listsStore.fetchItems(listId, true);
  }
}

export function useShoppingListsRealtime(scope: ShoppingListsRealtimeScope) {
  const { userId, familyId } = scope;
  const pageVisible = usePageVisible();
  const wasBackgroundedRef = useRef(false);
  const applyListChange = useShoppingListsStore((s) => s.applyListChange);
  const applyItemChange = useShoppingListsStore((s) => s.applyItemChange);
  const applyCategoryChange = useShoppingCategoriesStore((s) => s.applyCategoryChange);

  useEffect(() => {
    if (!userId) return;

    if (!pageVisible) {
      wasBackgroundedRef.current = true;
      return;
    }

    const supabase = createClient();
    const channelName = `shopping-lists:${userId}:${familyId ?? "solo"}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shopping_lists",
      },
      (payload) => {
        const typed = payload as RealtimePostgresChangesPayload<ShoppingList>;
        const knownListIds = new Set(
          useShoppingListsStore.getState().lists.map((list) => list.id)
        );
        if (!shouldApplyShoppingListRealtimeEvent(typed, { userId, familyId }, knownListIds)) {
          return;
        }
        applyListChange(typed);
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

        const lists = useShoppingListsStore.getState().lists;
        if (!lists.some((list) => list.id === listId)) return;

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
        },
        (payload) => {
          const row =
            (payload.new as ShoppingListCategory | undefined) ??
            (payload.old as ShoppingListCategory | undefined);
          if (row && row.family_id !== familyId) return;
          applyCategoryChange(
            payload as RealtimePostgresChangesPayload<ShoppingListCategory>
          );
        }
      );
    }

    channel.subscribe();

    if (wasBackgroundedRef.current) {
      wasBackgroundedRef.current = false;
      refetchShoppingListsOnResume();
    }

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, familyId, pageVisible, applyListChange, applyItemChange, applyCategoryChange]);
}
