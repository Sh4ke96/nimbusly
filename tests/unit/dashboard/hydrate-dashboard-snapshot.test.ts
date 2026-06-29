import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type { DashboardSnapshot } from "@/lib/dashboard/snapshot-types";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import {
  hydrateDashboardSnapshot,
  resetHydratedDashboardSnapshot,
} from "@/lib/dashboard/hydrate-dashboard-snapshot";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";

function minimalSnapshot(userId: string): DashboardSnapshot {
  return {
    user: { id: userId } as DashboardSnapshot["user"],
    profile: { id: userId } as DashboardSnapshot["profile"],
    family: null,
    members: [],
    invitations: [],
    budgets: [],
    expensesByBudgetId: {},
    memberIdsByBudgetId: {},
    shoppingLists: [
      {
        id: "list-1",
        name: "Groceries",
        created_by: userId,
        family_id: null,
        created_at: "",
        updated_at: "",
      },
    ],
    shoppingCategories: [
      {
        id: "cat-1",
        name: "Dairy",
        family_id: null,
        created_by: userId,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      },
    ],
    itemsByListId: {
      "list-1": [
        {
          id: "item-1",
          list_id: "list-1",
          content: "Milk",
          quantity: 1,
          category_id: null,
          checked: false,
          sort_order: 0,
          created_by: userId,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    notifications: [
      {
        id: "n-1",
        user_id: userId,
        title: "Hello",
        body: "World",
        type: NOTIFICATION_TYPE.NOTE_ADDED,
        payload: {},
        read_at: null,
        created_at: "",
      },
    ],
    notificationsUnreadCount: 1,
    gifts: [],
    medicineItems: [],
    watchlistItems: [],
    restaurantPlaces: [],
    pets: [],
    petCareItems: [],
    chores: [],
    notes: [],
    noteCategories: [],
    scheduleEntries: [],
    birthdays: [],
  };
}

describe("hydrateDashboardSnapshot", () => {
  beforeEach(() => {
    resetHydratedDashboardSnapshot();
    useNotificationsStore.getState().reset();
    useShoppingListsStore.getState().reset();
    useShoppingCategoriesStore.getState().reset();
  });

  it("hydrates notifications, shopping lists, categories and items", () => {
    hydrateDashboardSnapshot(minimalSnapshot("user-1"));

    const notifications = useNotificationsStore.getState();
    assert.equal(notifications.loaded, true);
    assert.equal(notifications.unreadCount, 1);
    assert.equal(notifications.items.length, 1);

    const shopping = useShoppingListsStore.getState();
    assert.equal(shopping.loaded, true);
    assert.equal(shopping.lists.length, 1);
    assert.equal(shopping.itemsByListId["list-1"]?.length, 1);

    const categories = useShoppingCategoriesStore.getState();
    assert.equal(categories.loaded, true);
    assert.equal(categories.categories.length, 1);
  });

  it("is idempotent for the same user id", () => {
    const snapshot = minimalSnapshot("user-1");
    hydrateDashboardSnapshot(snapshot);

    useNotificationsStore.setState({ unreadCount: 99 });
    hydrateDashboardSnapshot(snapshot);

    assert.equal(useNotificationsStore.getState().unreadCount, 99);
  });

  it("re-hydrates when user id changes", () => {
    hydrateDashboardSnapshot(minimalSnapshot("user-1"));
    hydrateDashboardSnapshot(minimalSnapshot("user-2"));

    assert.equal(useNotificationsStore.getState().items[0]?.user_id, "user-2");
  });
});
