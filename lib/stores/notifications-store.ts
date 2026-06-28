import { create } from "zustand";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  NOTIFICATIONS_PAGE_SIZE,
  type NotificationFilterTab,
} from "@/lib/constants/notifications";
import type { AppNotification } from "@/lib/notifications/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { useProfileStore } from "@/lib/stores/profile-store";

interface NotificationsStore {
  items: AppNotification[];
  unreadCount: number;
  loaded: boolean;
  loading: boolean;
  error: boolean;
  pageItems: AppNotification[];
  pageTotal: number;
  pageLoading: boolean;
  pageError: boolean;
  fetchNotifications: (force?: boolean) => Promise<void>;
  fetchNotificationsPage: (params: {
    filter: NotificationFilterTab;
    page: number;
  }) => Promise<void>;
  markReadLocally: (id: string) => void;
  markAllReadLocally: () => void;
  applyNotificationChange: (payload: RealtimePostgresChangesPayload<AppNotification>) => void;
  reset: () => void;
}

const initialState = {
  items: [] as AppNotification[],
  unreadCount: 0,
  loaded: false,
  loading: false,
  error: false,
  pageItems: [] as AppNotification[],
  pageTotal: 0,
  pageLoading: false,
  pageError: false,
};

function applyReadAt(items: AppNotification[], id: string, readAt: string) {
  return items.map((item) =>
    item.id === id ? { ...item, read_at: item.read_at ?? readAt } : item
  );
}

function mapNotificationRow(row: AppNotification): AppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    payload: row.payload ?? {},
    read_at: row.read_at,
    created_at: row.created_at,
  };
}

function countUnread(items: AppNotification[]): number {
  return items.filter((item) => !item.read_at).length;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...initialState,

  fetchNotifications: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("notifications:list", async () => {
      set({ loading: true, error: false });

      const user = useProfileStore.getState().user;
      if (!user) {
        set({ ...initialState, loaded: true, loading: false });
        return;
      }

      try {
        const supabase = createClient();
        const [listResult, unreadResult] = await Promise.all([
          supabase
            .from("notifications")
            .select("id, user_id, type, title, body, payload, read_at, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .is("read_at", null),
        ]);

        if (listResult.error || unreadResult.error) {
          set({ loading: false, loaded: true, error: true });
          return;
        }

        const items = (listResult.data ?? []) as AppNotification[];

        set({
          items,
          unreadCount: unreadResult.count ?? 0,
          loaded: true,
          loading: false,
          error: false,
        });
      } catch {
        set({ loading: false, loaded: true, error: true });
      }
    });
  },

  fetchNotificationsPage: async ({ filter, page }) => {
    const user = useProfileStore.getState().user;
    if (!user) {
      set({ pageItems: [], pageTotal: 0, pageLoading: false, pageError: false });
      return;
    }

    const dedupeKey = `notifications:page:${filter}:${page}`;
    return dedupeAsync(dedupeKey, async () => {
      set({ pageLoading: true, pageError: false });

      const from = (page - 1) * NOTIFICATIONS_PAGE_SIZE;
      const to = from + NOTIFICATIONS_PAGE_SIZE - 1;
      const supabase = createClient();

      let query = supabase
        .from("notifications")
        .select("id, user_id, type, title, body, payload, read_at, created_at", {
          count: "exact",
        })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filter === "unread") {
        query = query.is("read_at", null);
      } else if (filter === "read") {
        query = query.not("read_at", "is", null);
      }

      const { data, count, error } = await query;

      if (error) {
        set({ pageItems: [], pageTotal: 0, pageLoading: false, pageError: true });
        return;
      }

      set({
        pageItems: (data ?? []) as AppNotification[],
        pageTotal: count ?? 0,
        pageLoading: false,
        pageError: false,
      });
    });
  },

  markReadLocally: (id) => {
    const readAt = new Date().toISOString();
    const items = applyReadAt(get().items, id, readAt);
    const pageItems = applyReadAt(get().pageItems, id, readAt);
    const wasUnread = get().items.some((item) => item.id === id && !item.read_at);

    set({
      items,
      pageItems,
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
    });
  },

  markAllReadLocally: () => {
    const now = new Date().toISOString();
    const items = get().items.map((item) => ({
      ...item,
      read_at: item.read_at ?? now,
    }));
    const pageItems = get().pageItems.map((item) => ({
      ...item,
      read_at: item.read_at ?? now,
    }));
    set({ items, pageItems, unreadCount: 0 });
  },

  applyNotificationChange: (payload) => {
    const event = payload.eventType;

    if (event === "INSERT" && payload.new) {
      const row = mapNotificationRow(payload.new);
      if (get().items.some((item) => item.id === row.id)) return;

      const items = [row, ...get().items].slice(0, 50);
      const pageItems = get().pageItems.some((item) => item.id === row.id)
        ? get().pageItems
        : [row, ...get().pageItems].slice(0, NOTIFICATIONS_PAGE_SIZE);

      set({
        items,
        pageItems,
        unreadCount: get().unreadCount + (row.read_at ? 0 : 1),
        loaded: true,
        error: false,
      });
      return;
    }

    if (event === "UPDATE" && payload.new) {
      const row = mapNotificationRow(payload.new);
      const items = get().items.map((item) => (item.id === row.id ? row : item));
      const pageItems = get().pageItems.map((item) => (item.id === row.id ? row : item));

      set({
        items,
        pageItems,
        unreadCount: countUnread(items),
      });
      return;
    }

    if (event === "DELETE" && payload.old) {
      const id = payload.old.id;
      if (!id) return;

      const items = get().items.filter((item) => item.id !== id);
      const pageItems = get().pageItems.filter((item) => item.id !== id);

      set({
        items,
        pageItems,
        unreadCount: countUnread(items),
      });
    }
  },

  reset: () => set({ ...initialState }),
}));
