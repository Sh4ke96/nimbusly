import { create } from "zustand";
import {
  createInitialDemoState,
  type DemoChoreItemState,
  type DemoChoreId,
  type DemoNoteItemState,
  type DemoShoppingItemId,
  type DemoShoppingItemState,
} from "@/lib/demo/fixtures";
import {
  DEMO_VIEW,
  type DemoViewId,
} from "@/lib/constants/demo-mode";
import {
  SHOPPING_ITEM_QUANTITY_MAX,
  SHOPPING_ITEM_QUANTITY_MIN,
} from "@/lib/constants/shopping-categories";

interface DemoStore {
  activeView: DemoViewId;
  shoppingItems: DemoShoppingItemState[];
  choreItems: DemoChoreItemState[];
  notes: DemoNoteItemState[];
  setActiveView: (view: DemoViewId) => void;
  toggleShoppingChecked: (id: DemoShoppingItemId) => void;
  bumpShoppingQuantity: (id: DemoShoppingItemId, delta: number) => void;
  toggleChoreDone: (id: DemoChoreId) => void;
  toggleNotePinned: (id: DemoNoteItemState["id"]) => void;
  reset: () => void;
}

const initialInteractive = createInitialDemoState();

export const useDemoStore = create<DemoStore>((set, get) => ({
  activeView: DEMO_VIEW.DASHBOARD,
  ...initialInteractive,

  setActiveView: (view) => set({ activeView: view }),

  toggleShoppingChecked: (id) => {
    set({
      shoppingItems: get().shoppingItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    });
  },

  bumpShoppingQuantity: (id, delta) => {
    set({
      shoppingItems: get().shoppingItems.map((item) => {
        if (item.id !== id) return item;
        const quantity = Math.min(
          SHOPPING_ITEM_QUANTITY_MAX,
          Math.max(SHOPPING_ITEM_QUANTITY_MIN, item.quantity + delta)
        );
        return { ...item, quantity };
      }),
    });
  },

  toggleChoreDone: (id) => {
    set({
      choreItems: get().choreItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    });
  },

  toggleNotePinned: (id) => {
    set({
      notes: get().notes.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      ),
    });
  },

  reset: () => {
    const fresh = createInitialDemoState();
    set({
      activeView: DEMO_VIEW.DASHBOARD,
      ...fresh,
    });
  },
}));
