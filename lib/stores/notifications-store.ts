import { create } from "zustand";
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
  pageItems: AppNotification[];
  pageTotal: number;
  pageLoading: boolean;
  fetchNotifications: (force?: boolean) => Promise<void>;
  fetchNotificationsPage: (params: {
    filter: NotificationFilterTab;
    page: number;
  }) => Promise<void>;
  markReadLocally: (id: string) => void;
  markAllReadLocally: () => void;
  reset: () => void;
}

const initialState = {
  items: [] as AppNotification[],
  unreadCount: 0,
  loaded: false,
  loading: false,
  pageItems: [] as AppNotification[],
  pageTotal: 0,
  pageLoading: false,
};

function applyReadAt(items: AppNotification[], id: string, readAt: string) {
  return items.map((item) =>
    item.id === id ? { ...item, read_at: item.read_at ?? readAt } : item
  );
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...initialState,

  fetchNotifications: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("notifications:list", async () => {
      set({ loading: true });

      const user = useProfileStore.getState().user;
      if (!user) {
        set({ ...initialState, loaded: true, loading: false });
        return;
      }

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

      const items = (listResult.data ?? []) as AppNotification[];

      set({
        items,
        unreadCount: unreadResult.count ?? 0,
        loaded: true,
        loading: false,
      });
    });
  },

  fetchNotificationsPage: async ({ filter, page }) => {
    const user = useProfileStore.getState().user;
    if (!user) {
      set({ pageItems: [], pageTotal: 0, pageLoading: false });
      return;
    }

    const dedupeKey = `notifications:page:${filter}:${page}`;
    return dedupeAsync(dedupeKey, async () => {
      set({ pageLoading: true });

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
        set({ pageItems: [], pageTotal: 0, pageLoading: false });
        return;
      }

      set({
        pageItems: (data ?? []) as AppNotification[],
        pageTotal: count ?? 0,
        pageLoading: false,
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

  reset: () => set({ ...initialState }),
}));
