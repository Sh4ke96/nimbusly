import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/notifications/types";

interface NotificationsStore {
  items: AppNotification[];
  unreadCount: number;
  loaded: boolean;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markReadLocally: (id: string) => void;
  markAllReadLocally: () => void;
  reset: () => void;
}

const initialState = {
  items: [] as AppNotification[],
  unreadCount: 0,
  loaded: false,
  loading: false,
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...initialState,

  fetchNotifications: async () => {
    set({ loading: true });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ ...initialState, loaded: true, loading: false });
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, payload, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const items = (data ?? []) as AppNotification[];
    const unreadCount = items.filter((n) => !n.read_at).length;

    set({ items, unreadCount, loaded: true, loading: false });
  },

  markReadLocally: (id) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item
    );
    set({
      items,
      unreadCount: items.filter((n) => !n.read_at).length,
    });
  },

  markAllReadLocally: () => {
    const now = new Date().toISOString();
    const items = get().items.map((item) => ({
      ...item,
      read_at: item.read_at ?? now,
    }));
    set({ items, unreadCount: 0 });
  },

  reset: () => set({ ...initialState }),
}));
